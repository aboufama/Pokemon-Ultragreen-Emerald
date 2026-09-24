// Headless reference capture for the pokeemerald battle harness ROM.
//
// Boots the harness ROM (see tools/reference/harness) in libmgba, advances the
// wild-battle intro by tapping A until the action menu is up, then saves PNG
// screenshots of the real GBA frame buffer:
//
//   <prefix>_action.png   full screen with "What will X do?" (action menu)
//   <prefix>_obj.png      same frame, OBJ layer only (battler + healthbox sprites)
//   <prefix>_bg3.png      same frame, BG3 only (battle environment)
//   <prefix>_bg0.png      same frame, BG0 only (text box + menus)
//   <prefix>_sprites.json sprite positions/OAM of both battlers and healthboxes
//   <prefix>_moves.png    after selecting FIGHT (move menu)
//   <prefix>_intro_NNNN.png  every --intro-every frames during the intro (optional)
//
// usage: capture <rom.gba> <rom.map> <out_prefix> [key=value ...]
//   keys: player=<species id> enemy=<species id> plevel=<n> elevel=<n>
//         env=<battle environment id> flags=<bitfield> intro-every=<frames>
//
// Symbol addresses are resolved from the linker map so that the tool keeps
// working across decomp revisions.

#include <mgba/flags.h>
#include <mgba/core/core.h>
#include <mgba/gba/core.h>
#include <mgba-util/image/png-io.h>
#include <mgba-util/vfs.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define GBA_W 240
#define GBA_H 160
#define ROM_BASE 0x08000000u

#define KEY_A 0
#define KEY_B 1

// Video layer ids as listed by the GBA core: bg0..bg3, obj, win0, win1, objwin.
enum { LAYER_BG0, LAYER_BG1, LAYER_BG2, LAYER_BG3, LAYER_OBJ, LAYER_COUNT = 5 };

struct HarnessConfig {
	uint32_t magic;
	uint16_t playerSpecies;
	uint16_t enemySpecies;
	uint8_t playerLevel;
	uint8_t enemyLevel;
	uint8_t environment;
	uint8_t flags;
	uint16_t playerMoves[4];
	uint16_t enemyMoves[4];
};

static uint32_t findSymbol(const char* mapPath, const char* name) {
	FILE* f = fopen(mapPath, "r");
	if (!f) {
		perror(mapPath);
		exit(1);
	}
	char line[1024];
	uint32_t addr = 0;
	size_t nameLen = strlen(name);
	while (fgets(line, sizeof(line), f)) {
		// Map lines look like: "                0x0203ab10                gBattle_BG0_Y"
		char* p = strstr(line, name);
		if (!p || (p[nameLen] != '\n' && p[nameLen] != '\r' && p[nameLen] != ' ' && p[nameLen] != '\0')) {
			continue;
		}
		if (p > line && p[-1] != ' ') {
			continue;
		}
		char* hex = strstr(line, "0x");
		if (hex && hex < p) {
			addr = (uint32_t) strtoul(hex, NULL, 16);
			if (addr) {
				break;
			}
		}
	}
	fclose(f);
	if (!addr) {
		fprintf(stderr, "symbol not found in map: %s\n", name);
		exit(1);
	}
	return addr;
}

static mColor* frame;

static void savePng(const char* path) {
	struct VFile* vf = VFileOpen(path, O_CREAT | O_TRUNC | O_WRONLY);
	if (!vf) {
		fprintf(stderr, "cannot write %s\n", path);
		exit(1);
	}
	png_structp png = PNGWriteOpen(vf);
	png_infop info = PNGWriteHeader(png, GBA_W, GBA_H, mCOLOR_NATIVE);
	PNGWritePixels(png, GBA_W, GBA_H, GBA_W, frame, mCOLOR_NATIVE);
	PNGWriteClose(png, info);
	vf->close(vf);
	printf("saved %s\n", path);
}

static void runFrames(struct mCore* core, int n) {
	for (int i = 0; i < n; ++i) {
		core->runFrame(core);
	}
}

static void tap(struct mCore* core, int key) {
	core->setKeys(core, 1u << key);
	runFrames(core, 4);
	core->setKeys(core, 0);
	runFrames(core, 4);
}

static void setLayers(struct mCore* core, const int* enabled) {
	for (int i = 0; i < LAYER_COUNT; ++i) {
		core->enableVideoLayer(core, i, enabled[i]);
	}
}

// Captures are all rendered from one saved state so that every layer view shows
// the exact same emulated frame. The frame drawn during runFrame reflects the
// game logic of the previous frame, which is the state we inspected in RAM.
static void captureFromState(struct mCore* core, const void* state, const int* enabled, const char* path) {
	core->loadState(core, state);
	setLayers(core, enabled);
	core->runFrame(core);
	savePng(path);
	int all[LAYER_COUNT] = { 1, 1, 1, 1, 1 };
	setLayers(core, all);
}

#define SPRITE_SIZE 0x44

struct SpriteInfo {
	int id;
	int16_t x, y, x2, y2;
	int8_t cx, cy;
	uint8_t oam[8];
};

static struct SpriteInfo readSprite(struct mCore* core, uint32_t spritesAddr, int id) {
	struct SpriteInfo info = { .id = id };
	uint32_t base = spritesAddr + (uint32_t) id * SPRITE_SIZE;
	for (int i = 0; i < 8; ++i) {
		info.oam[i] = core->busRead8(core, base + i);
	}
	info.x = (int16_t) core->busRead16(core, base + 0x20);
	info.y = (int16_t) core->busRead16(core, base + 0x22);
	info.x2 = (int16_t) core->busRead16(core, base + 0x24);
	info.y2 = (int16_t) core->busRead16(core, base + 0x26);
	info.cx = (int8_t) core->busRead8(core, base + 0x28);
	info.cy = (int8_t) core->busRead8(core, base + 0x29);
	return info;
}

static void writeSpriteJson(FILE* f, const char* name, struct SpriteInfo s, int last) {
	fprintf(f, "    \"%s\": {\"spriteId\": %d, \"x\": %d, \"y\": %d, \"x2\": %d, \"y2\": %d, "
	           "\"centerToCornerX\": %d, \"centerToCornerY\": %d, \"oam\": [%d, %d, %d, %d, %d, %d, %d, %d]}%s\n",
	        name, s.id, s.x, s.y, s.x2, s.y2, s.cx, s.cy,
	        s.oam[0], s.oam[1], s.oam[2], s.oam[3], s.oam[4], s.oam[5], s.oam[6], s.oam[7], last ? "" : ",");
}

int main(int argc, char** argv) {
	if (argc < 4) {
		fprintf(stderr, "usage: %s <rom.gba> <rom.map> <out_prefix> [key=value ...]\n", argv[0]);
		return 1;
	}
	const char* romPath = argv[1];
	const char* mapPath = argv[2];
	const char* prefix = argv[3];

	int introEvery = 0;
	struct HarnessConfig override = { 0 };
	int haveOverride[16] = { 0 };

	for (int i = 4; i < argc; ++i) {
		char* eq = strchr(argv[i], '=');
		if (!eq) {
			continue;
		}
		*eq = '\0';
		long v = strtol(eq + 1, NULL, 0);
		if (!strcmp(argv[i], "player")) { override.playerSpecies = v; haveOverride[0] = 1; }
		else if (!strcmp(argv[i], "enemy")) { override.enemySpecies = v; haveOverride[1] = 1; }
		else if (!strcmp(argv[i], "plevel")) { override.playerLevel = v; haveOverride[2] = 1; }
		else if (!strcmp(argv[i], "elevel")) { override.enemyLevel = v; haveOverride[3] = 1; }
		else if (!strcmp(argv[i], "env")) { override.environment = v; haveOverride[4] = 1; }
		else if (!strcmp(argv[i], "flags")) { override.flags = v; haveOverride[5] = 1; }
		else if (!strcmp(argv[i], "intro-every")) { introEvery = (int) v; }
		else { fprintf(stderr, "unknown option %s\n", argv[i]); return 1; }
	}

	// Load and patch the ROM image in memory.
	FILE* rf = fopen(romPath, "rb");
	if (!rf) {
		perror(romPath);
		return 1;
	}
	fseek(rf, 0, SEEK_END);
	long romSize = ftell(rf);
	fseek(rf, 0, SEEK_SET);
	uint8_t* rom = malloc(romSize);
	if (fread(rom, 1, romSize, rf) != (size_t) romSize) {
		fprintf(stderr, "short read\n");
		return 1;
	}
	fclose(rf);

	uint32_t cfgAddr = findSymbol(mapPath, "gBattleHarnessConfig");
	uint32_t bg0yAddr = findSymbol(mapPath, "gBattle_BG0_Y");
	struct HarnessConfig* cfg = (struct HarnessConfig*) (rom + (cfgAddr - ROM_BASE));
	if (cfg->magic != 0x534E5248) {
		fprintf(stderr, "harness config magic mismatch at 0x%08x\n", cfgAddr);
		return 1;
	}
	if (haveOverride[0]) cfg->playerSpecies = override.playerSpecies;
	if (haveOverride[1]) cfg->enemySpecies = override.enemySpecies;
	if (haveOverride[2]) cfg->playerLevel = override.playerLevel;
	if (haveOverride[3]) cfg->enemyLevel = override.enemyLevel;
	if (haveOverride[4]) cfg->environment = override.environment;
	if (haveOverride[5]) cfg->flags = override.flags;

	struct mCore* core = GBACoreCreate();
	core->init(core);
	mCoreInitConfig(core, NULL);
	frame = calloc(GBA_W * GBA_H, sizeof(mColor));
	core->setVideoBuffer(core, frame, GBA_W);
	if (!core->loadROM(core, VFileFromMemory(rom, romSize))) {
		fprintf(stderr, "failed to load ROM\n");
		return 1;
	}
	core->reset(core);

	// Intro: tap A every 16 frames until BG0 scrolls to the action menu page (y=160).
	char path[1024];
	int frameNo = 0;
	const int maxFrames = 60 * 40;
	while (frameNo < maxFrames) {
		uint16_t bg0y = core->busRead16(core, bg0yAddr);
		if (bg0y == 160) {
			break;
		}
		if (introEvery && frameNo % introEvery == 0) {
			snprintf(path, sizeof(path), "%s_intro_%04d.png", prefix, frameNo);
			savePng(path);
		}
		if (frameNo > 60 && frameNo % 16 == 0) {
			core->setKeys(core, 1u << KEY_A);
		} else if (frameNo % 16 == 4) {
			core->setKeys(core, 0);
		}
		core->runFrame(core);
		++frameNo;
	}
	core->setKeys(core, 0);
	if (frameNo >= maxFrames) {
		fprintf(stderr, "timed out waiting for the action menu\n");
		snprintf(path, sizeof(path), "%s_timeout.png", prefix);
		savePng(path);
		return 2;
	}
	// The player's battler and healthbox bob while the action menu is open.
	// Wait for both to pass through their rest position (y2 == 0).
	uint32_t spritesAddr = findSymbol(mapPath, "gSprites");
	uint32_t battlerIdsAddr = findSymbol(mapPath, "gBattlerSpriteIds");
	uint32_t healthboxIdsAddr = findSymbol(mapPath, "gHealthboxSpriteIds");
	runFrames(core, 20);
	struct SpriteInfo playerMon, enemyMon, playerBox, enemyBox;
	for (int i = 0; i < 240; ++i) {
		core->runFrame(core);
		playerMon = readSprite(core, spritesAddr, core->busRead8(core, battlerIdsAddr + 0));
		playerBox = readSprite(core, spritesAddr, core->busRead8(core, healthboxIdsAddr + 0));
		if (playerMon.y2 == 0 && playerBox.y2 == 0) {
			break;
		}
	}
	enemyMon = readSprite(core, spritesAddr, core->busRead8(core, battlerIdsAddr + 1));
	enemyBox = readSprite(core, spritesAddr, core->busRead8(core, healthboxIdsAddr + 1));
	printf("action menu reached after %d frames\n", frameNo);

	size_t stateSize = core->stateSize(core);
	void* state = malloc(stateSize);
	core->saveState(core, state);

	int allLayers[LAYER_COUNT] = { 1, 1, 1, 1, 1 };
	int onlyObj[LAYER_COUNT] = { 0, 0, 0, 0, 1 };
	int onlyBg3[LAYER_COUNT] = { 0, 0, 0, 1, 0 };
	int onlyBg0[LAYER_COUNT] = { 1, 0, 0, 0, 0 };
	snprintf(path, sizeof(path), "%s_action.png", prefix);
	captureFromState(core, state, allLayers, path);
	snprintf(path, sizeof(path), "%s_obj.png", prefix);
	captureFromState(core, state, onlyObj, path);
	snprintf(path, sizeof(path), "%s_bg3.png", prefix);
	captureFromState(core, state, onlyBg3, path);
	snprintf(path, sizeof(path), "%s_bg0.png", prefix);
	captureFromState(core, state, onlyBg0, path);
	core->loadState(core, state);
	free(state);

	snprintf(path, sizeof(path), "%s_sprites.json", prefix);
	FILE* jf = fopen(path, "w");
	fprintf(jf, "{\n  \"playerSpecies\": %d,\n  \"enemySpecies\": %d,\n  \"introFrames\": %d,\n  \"sprites\": {\n",
	        cfg->playerSpecies, cfg->enemySpecies, frameNo);
	writeSpriteJson(jf, "playerMon", playerMon, 0);
	writeSpriteJson(jf, "enemyMon", enemyMon, 0);
	writeSpriteJson(jf, "playerHealthbox", playerBox, 0);
	writeSpriteJson(jf, "enemyHealthbox", enemyBox, 1);
	fprintf(jf, "  }\n}\n");
	fclose(jf);
	printf("saved %s\n", path);

	// FIGHT -> move menu (BG0 page at y=320).
	tap(core, KEY_A);
	for (int i = 0; i < 120 && core->busRead16(core, bg0yAddr) != 320; ++i) {
		core->runFrame(core);
	}
	runFrames(core, 20);
	snprintf(path, sizeof(path), "%s_moves.png", prefix);
	savePng(path);

	core->deinit(core);
	free(frame);
	return 0;
}
