// Headless sound recording of the pokeemerald harness ROM (see
// tools/reference/harness): the game's own sound engine, played by mGBA.
//
// The ROM image is patched in memory to the harness's sound mode (SOUND_MAGIC
// in gBattleHarnessConfig), so it plays songs instead of starting a battle,
// then a script of operations drives it:
//
//   w<n>   run n frames, recording the audio
//   s<n>   start song number n (m4aSongNumStart; constants/songs.h)
//   c<n>   command n: 2 stop the BGM, 3 continue it, 4 fade it out
//   m<n>   mute channels in mask n: bits 0-3 the GB channels, 4-5 DirectSound A/B
//
// usage: sound <rom.gba> <rom.map> <out.raw> [op ...]
// out.raw is mGBA's output, interleaved int16 stereo at the rate printed on
// stdout (65536 Hz for Emerald's sound mode). Used by tools/sound/reference/run.py.

#include <mgba/flags.h>
#include <mgba/core/core.h>
#include <mgba/core/log.h>
#include <mgba/gba/core.h>
#include <mgba-util/audio-buffer.h>
#include <mgba-util/vfs.h>

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ROM_BASE 0x08000000u
#define HARNESS_MAGIC 0x534E5248u // "HRNS"
#define SOUND_MAGIC 0x444E5353u   // "SSND"

static struct mCore* core;
static FILE* out;
static size_t total;

static void quiet(struct mLogger* logger, int category, enum mLogLevel level, const char* format, va_list args) {
	(void) logger;
	(void) category;
	(void) level;
	(void) format;
	(void) args;
}

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
		// Map lines look like: "                0x03000004                gSoundHarness"
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
		fprintf(stderr, "symbol %s not found in %s\n", name, mapPath);
		exit(1);
	}
	return addr;
}

static void drain(void) {
	static int16_t buf[8192 * 2];
	struct mAudioBuffer* ab = core->getAudioBuffer(core);
	size_t n;
	while ((n = mAudioBufferAvailable(ab)) > 0) {
		if (n > 8192) {
			n = 8192;
		}
		n = mAudioBufferRead(ab, buf, n);
		fwrite(buf, 4, n, out);
		total += n;
	}
}

int main(int argc, char** argv) {
	if (argc < 4) {
		fprintf(stderr, "usage: %s <rom.gba> <rom.map> <out.raw> [op ...]\n", argv[0]);
		return 1;
	}
	static struct mLogger logger = { .log = quiet };
	mLogSetDefaultLogger(&logger);

	// Load the ROM and switch the harness to its sound mode.
	FILE* rf = fopen(argv[1], "rb");
	if (!rf) {
		perror(argv[1]);
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
	uint32_t cfgAddr = findSymbol(argv[2], "gBattleHarnessConfig");
	uint32_t mailbox = findSymbol(argv[2], "gSoundHarness");
	uint32_t* magic = (uint32_t*) (rom + (cfgAddr - ROM_BASE));
	if (*magic != HARNESS_MAGIC) {
		fprintf(stderr, "harness config magic mismatch at 0x%08x\n", cfgAddr);
		return 1;
	}
	*magic = SOUND_MAGIC;

	core = GBACoreCreate();
	core->init(core);
	mCoreInitConfig(core, NULL);
	static mColor video[240 * 160];
	core->setVideoBuffer(core, video, 240);
	if (!core->loadROM(core, VFileFromMemory(rom, romSize))) {
		fprintf(stderr, "failed to load ROM\n");
		return 1;
	}
	core->setAudioBufferSize(core, 32768);
	core->reset(core);

	out = fopen(argv[3], "wb");
	if (!out) {
		perror(argv[3]);
		return 1;
	}
	for (int a = 4; a < argc; a++) {
		char op = argv[a][0];
		long v = strtol(argv[a] + 1, NULL, 10);
		if (op == 's') {
			core->busWrite16(core, mailbox, (uint16_t) v);
			core->busWrite16(core, mailbox + 2, 1);
		} else if (op == 'c') {
			core->busWrite16(core, mailbox + 2, (uint16_t) v);
		} else if (op == 'm') {
			for (int ch = 0; ch < 6; ch++) {
				core->enableAudioChannel(core, ch, !(v & (1 << ch)));
			}
		} else if (op == 'w') {
			for (long f = 0; f < v; f++) {
				core->runFrame(core);
				drain();
			}
		}
	}
	fclose(out);
	printf("rate %u samples %zu frames %u\n", core->audioSampleRate(core), total, core->frameCounter(core));
	core->deinit(core);
	return 0;
}
