#!/usr/bin/env python3
"""Records platform/tests/opening.json, Pokémon Emerald's opening, on the
decomp's own GBA ROM (decomp/pokeemerald/pokeemerald_modern.gba, in mGBA as
tools/reference.py runs it), and checks that the script survives the timing
differences the compiled game can have.

    python3 platform/tests/opening.py                   # records opening.json
    python3 platform/tests/opening.py --check           # replays it perturbed
    python3 platform/tests/opening.py --check battles   # one group (timing, rng, battles)

Recording: the ROM is played and each key is pressed a margin (30 frames)
after the game starts waiting for it (read from its memory through the ELF's
symbols: a text printer at a prompt, the script engine waiting for A/B, a
menu's task, the player free to move), so a game that runs a few frames
early or late is still waiting when the key comes. Walking holds a direction
until the last step has begun and 8 frames more (mid-step), so a shift of up
to 8 frames neither drops nor adds a step. Paths keep clear of the tiles the
wandering people can reach.

The RNG is seeded from a timer when the naming screen closes and steps every
frame, so the compiled game's random numbers can differ from the ROM's from
there on. The Zigzagoon battle is where they change the timeline: TREECKO's
and the Zigzagoon's stats, the damage rolls, how often it uses Growl, a 5%
ORAN BERRY (+10 HP, once); no critical hits in this battle. 3 turns on the
ROM, 2-4 in 91% of battles, up to 8 in 160 battles sampled on the ROM; by a
model of the game's damage rules about 1 in 1000 takes more than 10. From the
battle's first frame the script runs a fixed schedule that works for any
battle whose last move is chosen by the last pair: up to 13 turns, 12 with
the berry (by the model, all but 1 in 15000):
  - A twice, 20 frames apart, every 700 frames (NPAIRS times): FIGHT then
    POUND. The first two go to the battle's intro, then each turn takes one
    (Growl ~630 frames, Tackle ~440), the turn the berry is eaten two
    (~1130). In text a pair advances one box, two only for Birch's "Oh?",
    so a battle's leftover pairs advance at most 13 of the 14 boxes between
    its last move and the nickname question (a one-turn battle, shorter
    than any real one; 12 for two turns).
  - Then B every 30 frames: the rest of the text, the nickname question (NO)
    and Birch's "go see MAY?" (NO), which goes back to "Oh, don't be that
    way." and the same YES/NO: a holding pattern whatever the battle length.
  - At SETTLE every covered battle is in that pattern (the longest reach it
    about 450 frames before): nothing for W frames, so the YES/NO settles on
    screen, then A: YES. B again through the rest of the text, then DOWN:
    every player free on the same tile, facing the same way, at the same
    frame.
The wild battle in the grass depends on the RNG too: each step in Route 101's
tall grass starts one with a chance of 1 in 9. The legs (left and right on
the bottom-left patch, 69 steps) are walked without stopping, timed once
with encounters held off, then played as a fixed schedule to the end
whatever happens (in a battle the directions do nothing); the script ends as
long after the last step as a battle takes from its encounter to its first
text, and TAIL more. So a battle that starts on any step is on screen at the
end: every RNG but about 3 in 10000 (none in 69 steps) ends in a wild battle,
however far into it.

--check replays the script perturbed, each run from the unperturbed run's
state at its first change, and reports whether it follows the same path,
answers the nickname question NO, leaves the lab on the same tile at the
same frame and ends in a wild battle with its first text on screen:
  timing   the inputs shifted by a few frames (at the start and at every
           sixth checkpoint), jittered press by press;
  rng      another RNG from just after the naming screen on (another timer
           reading there: the compiled game's timing need not be the ROM's
           to the cycle), which changes the battle and the grass too;
  battles  the Zigzagoon battle forced to 1-13 turns (no berry), the RNG
           values that gave the longest battles found (6-8 turns) and random
           ones, set just before the starter YES.
"""

import argparse
import copy
import json
import multiprocessing
import os
import random
import subprocess
import sys

import mgba.core
import mgba.image
import mgba.log
from mgba._pylib import ffi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
ROM = os.path.join(ROOT, 'decomp/pokeemerald/pokeemerald_modern.gba')
ELF = os.path.join(ROOT, 'decomp/pokeemerald/pokeemerald_modern.elf')
OUT = os.path.join(ROOT, 'platform/tests/opening.json')
KEYS = {'A': 0, 'B': 1, 'SELECT': 2, 'START': 3, 'RIGHT': 4, 'LEFT': 5, 'UP': 6, 'DOWN': 7, 'R': 8, 'L': 9}
TIME = [2026, 1, 1, 4, 10, 0, 0]

HOLD = 5          # frames a key is held
MARGIN = 30       # frames after the game starts waiting before a key is pressed
# The battle and the lab, in frames from the battle's first frame (see above).
NPAIRS, C = 15, 700                  # A pairs (FIGHT, POUND), one every C frames
SETTLE, W = NPAIRS * C + 3800, 400   # then nothing for W frames, then A: YES
TAP = SETTLE + W + 500               # DOWN
# The grass: left and right on Route 101's bottom-left patch (row 15, x 1-5),
# 69 steps; with 1 in 9 steps starting a battle, 3 in 10000 RNGs find none.
LEGS = [('LEFT', 5)] + [('RIGHT', 4), ('LEFT', 4)] * 8
TAIL = 150                           # frames of the wild battle's first text at the end, at least

# (mapGroup, mapNum)
TRUCK, LITTLEROOT, ROUTE101 = (25, 40), (0, 9), (0, 16)
HOUSE_1F, HOUSE_2F, MAYS_1F, MAYS_2F, LAB = (1, 0), (1, 1), (1, 2), (1, 3), (1, 4)
SPECIES = {277: 'TREECKO', 286: 'POOCHYENA', 288: 'ZIGZAGOON', 290: 'WURMPLE'}
FACING = {1: 'down', 2: 'up', 3: 'left', 4: 'right'}


def keys_from(text):
    return [KEYS[k.upper()] for k in text.replace(',', '+').replace(' ', '+').split('+') if k]


def load_symbols():
    out = subprocess.run(['arm-none-eabi-nm', ELF], capture_output=True, text=True, check=True).stdout
    names, funcs = {}, {}
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 3:
            addr, kind, name = int(parts[0], 16), parts[1], parts[2]
            names.setdefault(name, addr)
            if kind in 'tT':
                funcs.setdefault(addr & ~1, name)
    return names, funcs


SYM, FUNC = load_symbols()


class Rom:
    """The ROM in mGBA, run as tools/reference.py runs it: frame f is run with
    the keys of the last input at or before f."""

    def __init__(self):
        mgba.log.silence()
        self.core = mgba.core.load_path(ROM)
        w, h = self.core.desired_video_dimensions()
        self.image = mgba.image.Image(w, h)
        self.core.set_video_buffer(self.image)
        self.core.reset()
        self.mem = self.core.memory
        self.f = 0
        self.keys = ''
        self.inputs = []

    def set_keys(self, keys):
        if keys != self.keys:
            self.inputs.append([self.f + 1, keys])
            self.keys = keys

    def run_frame(self):
        self.core.clear_keys(*KEYS.values())
        k = keys_from(self.keys)
        if k:
            self.core.set_keys(*k)
        self.core.run_frame()
        self.f += 1

    def save(self):
        return bytes(self.core.save_raw_state()), self.f, self.keys, [list(x) for x in self.inputs]

    def load(self, state):
        raw, self.f, self.keys, inputs = state
        self.core.load_raw_state(ffi.new('unsigned char[%d]' % len(raw), raw))
        self.inputs = [list(x) for x in inputs]

    # memory
    def u8(self, a):
        return self.mem.u8[a]

    def s16(self, a):
        return self.mem.s16[a]

    def u16(self, a):
        return self.mem.u16[a]

    def u32(self, a):
        return self.mem.u32[a]

    def func(self, ptr):
        return FUNC.get(ptr & ~1) if ptr else None

    # game state
    def cb2(self):
        return self.func(self.u32(SYM['gMain'] + 4))                       # gMain.callback2

    def in_battle(self):
        return bool(self.u8(SYM['gMain'] + 0x439) & 2)                     # gMain.inBattle

    def tasks(self):
        out = []
        for i in range(16):                                                 # gTasks: 16 x 0x28
            t = SYM['gTasks'] + i * 0x28
            if self.u8(t + 4):
                out.append(self.func(self.u32(t)))
        return out

    def task_data(self, name, i):
        for k in range(16):
            t = SYM['gTasks'] + k * 0x28
            if self.u8(t + 4) and self.func(self.u32(t)) == name:
                return self.s16(t + 8 + 2 * i)
        return None

    def has_task(self, name):
        return name in self.tasks()

    def fading(self):
        return bool(self.u8(SYM['gPaletteFade'] + 7) & 0x80)                # gPaletteFade.active

    def printer(self):
        p = SYM['sTextPrinters']                                            # window 0's printer
        return self.u8(p + 0x1B), self.u8(p + 0x1C)                         # active, state

    def script(self):
        ctx = SYM['sGlobalScriptContext']
        return (self.u8(SYM['sGlobalScriptContextStatus']), self.u8(ctx + 1),
                self.func(self.u32(ctx + 4)), self.u8(SYM['sLockFieldControls']))

    def loc(self):
        sb1 = self.u32(SYM['gSaveBlock1Ptr'])
        return self.u8(sb1 + 4), self.u8(sb1 + 5)                           # location.mapGroup, mapNum

    def xy(self):
        o = SYM['gObjectEvents'] + self.u8(SYM['gPlayerAvatar'] + 5) * 0x24
        return self.s16(o + 0x10) - 7, self.s16(o + 0x12) - 7               # currentCoords - MAP_OFFSET

    def enemy_hp(self):
        return self.u16(SYM['gBattleMons'] + 0x58 + 0x28)

    def controller(self):
        return self.func(self.u32(SYM['gBattlerControllerFuncs']))

    def text_waiting(self):
        """A text box waits for A or B: its printer at a prompt (\\p, \\l, a
        wait) or the script engine in waitbuttonpress."""
        active, state = self.printer()
        if active and state in (1, 2, 3):
            return True
        status, mode, native, _ = self.script()
        return mode == 2 and native == 'WaitForAorBPress'

    def yesno(self):
        return self.has_task('Task_HandleYesNoInput')

    def overworld_free(self):
        if self.cb2() != 'CB2_Overworld' or self.fading():
            return False
        status, _, _, locked = self.script()
        if status != 2 or locked:                                           # CONTEXT_SHUTDOWN: no script
            return False
        return self.u8(SYM['gPlayerAvatar'] + 3) == 0 and not self.printer()[0]


class Recorder(Rom):
    def __init__(self):
        super().__init__()
        self.marks = []
        self.free_run = 0
        self.hook = None

    def step(self, n=1):
        for _ in range(n):
            if self.hook:
                self.hook(self)
            self.run_frame()
            self.free_run = self.free_run + 1 if self.overworld_free() else 0

    def free(self):
        """Free to move for 10 frames: a map's scripts have had their turn."""
        return self.free_run >= 10

    def mark(self, name, delay=0):
        self.step(delay)
        self.marks.append((self.f, name))

    def wait(self, cond, what, limit=30000):
        start = self.f
        while not cond():
            if self.f - start > limit:
                raise RuntimeError(f'frame {self.f}: no {what}')
            self.step()

    def press(self, keys, hold=HOLD):
        self.set_keys(keys)
        self.step(hold)
        self.set_keys('')

    def press_when(self, cond, keys, what, margin=MARGIN):
        self.wait(cond, what)
        self.step(margin)
        if not cond():
            raise RuntimeError(f'frame {self.f}: {what} gone')
        self.press(keys)

    def talk(self, until, key='A', marks=None):
        """Advance the text with key, box by box, until until()."""
        n = 0
        while True:
            self.wait(lambda: until() or self.text_waiting(), 'text')
            if until():
                return n
            self.step(MARGIN)
            if not self.text_waiting():
                raise RuntimeError(f'frame {self.f}: text wait gone')
            if marks and n in marks:
                self.mark(marks[n])
            self.press(key)
            n += 1
            self.wait(lambda: not self.text_waiting(), 'text advanced', 120)

    def walk(self, d, n):
        """n tiles from a standstill: hold until the nth step has begun, then
        8 frames more (mid-step)."""
        self.wait(self.free, f'free to walk {d}')
        self.step(MARGIN)
        pos, seen = self.xy(), 0
        start = self.f
        self.set_keys(d)
        while seen < n:
            self.step()
            if self.xy() != pos:
                pos, seen = self.xy(), seen + 1
            if self.f - start > 40 + 20 * n:
                raise RuntimeError(f'frame {self.f}: walk {d} {n} stuck at {pos}')
        self.step(8)
        self.set_keys('')

    def walk_legs(self, legs):
        """Legs [(direction, tiles), ...] from a standstill without stopping:
        each leg's direction is held until its last step has begun and 8
        frames more (mid-step), then the next leg's is, so the player walks on
        into it as that step ends (a turn in place only comes from a
        standstill)."""
        self.wait(self.free, 'free to walk the legs')
        self.step(MARGIN)
        pos = self.xy()
        start, total = self.f, sum(n for _, n in legs)
        for d, n in legs:
            self.set_keys(d)
            seen = 0
            while seen < n:
                self.step()
                if self.xy() != pos:
                    pos, seen = self.xy(), seen + 1
                if self.f - start > 40 + 20 * total:
                    raise RuntimeError(f'frame {self.f}: legs stuck at {pos}')
            self.step(8)
        self.set_keys('')

    def walk_into(self, d, what, cond):
        """Hold a direction into a door, stairs or the next map until cond()."""
        self.wait(self.free, f'free for {what}')
        self.step(MARGIN)
        start = self.f
        self.set_keys(d)
        while not cond():
            self.step()
            if self.f - start > 200:
                raise RuntimeError(f'frame {self.f}: {what} never came')
        self.step(8)
        self.set_keys('')

    def face(self, d):
        """Turn in place (a tap shorter than the 8-frame turn)."""
        self.wait(self.free, f'free to face {d}')
        self.step(MARGIN)
        self.press(d, 3)


def battle_keys(t):
    """The battle and the lab: the keys t frames after the battle's first frame."""
    def b(t0):                                            # B every 30 frames from t0
        return 'B' if t >= t0 and (t - t0) % 30 < 5 else ''
    if t < C * NPAIRS:                                    # FIGHT, POUND
        return 'A' if t % C < 5 or 20 <= t % C < 25 else ''
    if t < SETTLE:
        return b(C * NPAIRS)
    if t < SETTLE + W:
        return ''
    if t < SETTLE + W + 5:
        return 'A'
    if t < TAP:
        return b(SETTLE + W + 30)
    if t < TAP + 3:
        return 'DOWN'
    return ''


def record():
    r = Recorder()
    loc = r.loc

    # Power-on, the intro (any key skips it), the title, NEW GAME, Birch.
    r.step(299)
    r.press('START')
    r.press_when(lambda: r.has_task('Task_TitleScreenPhase3'), 'START', 'title', margin=40)
    r.mark('title screen: START')
    r.press_when(lambda: r.has_task('Task_HandleMainMenuInput'), 'A', 'main menu')
    r.mark('main menu: NEW GAME')
    r.wait(r.text_waiting, "Birch's speech")
    r.mark("Birch's speech")
    r.talk(lambda: r.has_task('Task_NewGameBirchSpeech_ChooseGender'), marks={5: "Birch's speech: Lotad, a POKeMON"})
    r.step(20)
    r.mark('boy or girl: BOY (Brendan)')
    r.press_when(lambda: r.has_task('Task_NewGameBirchSpeech_ChooseGender'), 'A', 'boy')
    r.talk(lambda: r.has_task('Task_NewGameBirchSpeech_WaitPressBeforeNameChoice'))
    r.press_when(lambda: r.has_task('Task_NewGameBirchSpeech_WaitPressBeforeNameChoice'), 'A', "what's your name")

    # The naming screen: E, M, E, R on the upper case page, START (OK), A.
    ready = lambda: r.has_task('Task_NamingScreen') and not r.fading() and r.task_data('Task_HandleInput', 0) == 1
    r.wait(ready, 'naming screen')
    r.step(30)
    r.mark('naming screen')
    for k in ['RIGHT'] * 4 + ['A'] + ['DOWN'] * 2 + ['LEFT'] * 4 + ['A'] + ['UP'] * 2 + ['RIGHT'] * 4 + ['A'] + ['DOWN'] * 2 + ['RIGHT', 'A', 'START']:
        r.press(k)
        r.step(15)
    r.mark('naming screen: EMER')
    r.press('A')
    r.wait(lambda: r.has_task('Task_NewGameBirchSpeech_ProcessNameYesNoMenu'), "so it's EMER?")
    r.mark("so it's EMER? YES", 12)
    r.press_when(lambda: r.has_task('Task_NewGameBirchSpeech_ProcessNameYesNoMenu'), 'A', "so it's EMER? YES")
    r.talk(lambda: r.cb2() == 'CB2_Overworld')

    # The truck; Mom outside and in the house.
    r.wait(r.free, 'the truck')
    r.mark('inside the truck')
    r.walk('RIGHT', 1)
    r.walk_into('RIGHT', 'truck door', lambda: loc() != TRUCK or r.fading())
    r.wait(lambda: loc() == LITTLEROOT and r.text_waiting(), 'Mom outside')
    r.mark('Littleroot: Mom at the truck')
    r.talk(lambda: loc() == HOUSE_1F and r.text_waiting())
    r.mark("the house: Mom: isn't it nice in here?")
    r.talk(lambda: loc() == HOUSE_1F and r.free())

    # Upstairs, the wall clock (10:00; YES), Mom, downstairs, the TV.
    r.walk('UP', 4)
    r.walk_into('UP', 'stairs up', lambda: loc() != HOUSE_1F or r.fading())
    r.wait(lambda: loc() == HOUSE_2F and r.free(), 'the bedroom')
    r.mark('bedroom')
    r.walk('LEFT', 2)
    r.face('UP')
    r.wait(r.free, 'facing the clock')
    r.step(20)
    r.press('A')
    clock = lambda: r.has_task('Task_SetClock_HandleInput') and not r.fading()
    r.talk(clock)
    r.step(30)
    r.mark('the wall clock')
    r.press_when(clock, 'A', 'clock set')
    confirm = lambda: r.has_task('Task_SetClock_HandleConfirmInput')
    r.press_when(confirm, 'UP', 'clock: the cursor starts on NO')
    r.step(10)
    r.mark('the wall clock: is this the correct time? YES')
    r.press_when(confirm, 'A', 'clock: YES')
    r.wait(lambda: r.cb2() == 'CB2_Overworld' and r.text_waiting(), 'Mom upstairs')
    r.mark('Mom: how do you like your new room?')
    r.talk(lambda: loc() == HOUSE_2F and r.free())
    r.walk('RIGHT', 2)
    r.walk_into('UP', 'stairs down', lambda: loc() != HOUSE_2F or r.fading())
    r.wait(lambda: loc() == HOUSE_1F and r.text_waiting(), 'Mom and the TV')
    r.mark('Mom: quick! come quickly!')
    r.talk(lambda: loc() == HOUSE_1F and r.free(), marks={1: 'the TV: maybe DAD will be on!', 2: 'the TV: report from PETALBURG GYM'})

    # Next door: May's mom, upstairs, the Poke Ball, May.
    r.walk('RIGHT', 4)
    r.walk('DOWN', 2)
    r.walk_into('DOWN', 'front door', lambda: loc() != HOUSE_1F or r.fading())
    r.wait(lambda: loc() == LITTLEROOT and r.free(), 'outside')
    r.mark('Littleroot: out of the house')
    r.walk('RIGHT', 9)
    r.walk_into('UP', "May's door", lambda: loc() != LITTLEROOT or r.fading())
    r.wait(lambda: loc() == MAYS_1F and r.text_waiting(), "May's mom")
    r.mark("May's house: her mom")
    r.talk(lambda: loc() == MAYS_1F and r.free())
    r.walk('UP', r.xy()[1] - 3)
    r.walk_into('UP', "May's stairs", lambda: loc() != MAYS_1F or r.fading())
    r.wait(lambda: loc() == MAYS_2F and r.free(), "May's room")
    r.mark("May's room")
    r.walk('RIGHT', 5 - r.xy()[0])
    r.walk('DOWN', 3 - r.xy()[1])
    r.wait(r.free, 'the Poke Ball')
    r.step(20)
    r.press('A')
    r.wait(r.text_waiting, 'May')
    r.mark('May: who are you?')
    r.talk(lambda: loc() == MAYS_2F and r.free())
    r.walk('UP', 1)
    r.walk('LEFT', 4)
    r.walk_into('UP', "May's stairs down", lambda: loc() != MAYS_2F or r.fading())
    r.wait(lambda: loc() == MAYS_1F and r.free(), "May's 1F")
    r.walk('DOWN', 7 - r.xy()[1])
    r.walk_into('DOWN', "May's front door", lambda: loc() != MAYS_1F or r.fading())
    r.wait(lambda: loc() == LITTLEROOT and r.free(), 'Littleroot')

    # North: the twin, Route 101, Birch chased by the Zigzagoon.
    r.walk('LEFT', 3)
    r.walk('UP', 8)
    r.wait(r.text_waiting, 'the twin')
    r.mark('Littleroot: the girl at the north exit')
    r.talk(lambda: loc() == LITTLEROOT and r.free())
    r.walk('UP', 1)
    r.walk_into('UP', 'Route 101', lambda: loc() == ROUTE101)
    r.wait(r.text_waiting, 'help me')
    r.mark('Route 101: H-help me!')
    r.talk(lambda: loc() == ROUTE101 and r.free(), marks={2: "Route 101: Birch: in my BAG! There's a POKe BALL!"})

    # The bag, TREECKO.
    r.walk('UP', 1)
    r.walk('LEFT', 3)
    r.wait(r.free, 'the bag')
    r.step(20)
    r.press('A')
    chooser = lambda: r.has_task('Task_HandleStarterChooseInput') and not r.fading()
    r.wait(chooser, 'the starters')
    r.step(20)
    r.mark("the bag: Birch's POKe BALLs (the cursor starts on TORCHIC)")
    r.press_when(chooser, 'LEFT', 'TREECKO')
    r.press_when(chooser, 'A', 'TREECKO')
    r.wait(lambda: r.has_task('Task_HandleConfirmStarterInput'), 'do you choose this POKeMON?')
    r.step(20)
    r.mark('TREECKO: do you choose this POKeMON? YES')
    r.press_when(lambda: r.has_task('Task_HandleConfirmStarterInput'), 'A', 'TREECKO: YES')
    before_battle = r.save()
    r.wait(r.in_battle, 'the battle')
    s0 = r.f

    # The battle and the lab: the fixed schedule.
    seen, prompts = set(), []
    was_yesno = False

    def once(key, cond, name, delay):
        if key not in seen and cond():
            seen.add(key)
            r.marks.append((r.f + delay, name))

    while r.f - s0 < TAP + 30:
        t = r.f - s0
        r.set_keys(battle_keys(t))
        r.step()
        y = r.yesno()
        if y and not was_yesno:
            prompts.append(r.f)
        was_yesno = y
        b = r.in_battle()
        once('appeared', lambda: b and r.text_waiting(), 'battle: Wild ZIGZAGOON appeared!', 10)
        once('menu', lambda: b and r.controller() == 'HandleInputChooseAction', 'battle: what will TREECKO do? FIGHT', 10)
        once('pound', lambda: b and r.controller() == 'PlayerDoMoveAnimation', 'battle: TREECKO used POUND!', 12)
        once('fainted', lambda: b and r.enemy_hp() == 0 and r.text_waiting(), 'battle: Wild ZIGZAGOON fainted!', 10)
        once('thanks', lambda: not b and loc() == ROUTE101 and r.text_waiting(), 'Route 101: Birch: whew...', 10)
        once('lab', lambda: loc() == LAB and r.text_waiting(), 'the lab: Birch: so, EMER.', 10)
        once('received', lambda: loc() == LAB and r.script()[1:3] == (2, 'WaitForFanfareFinish'), 'the lab: EMER received the TREECKO!', 30)
        once('nickname', lambda: len(prompts) >= 1, 'the lab: nickname the TREECKO? NO', 10)
        once('go see', lambda: len(prompts) >= 2, 'the lab: go see MAY? NO', 10)
        once('dont be', lambda: len(prompts) >= 3, "the lab: oh, don't be that way. NO", 10)
        once('great', lambda: t > SETTLE + W + 5 and r.text_waiting(), 'the lab: YES: great!', 10)
    r.set_keys('')
    if r.in_battle() or len(prompts) < 3:
        raise RuntimeError(f'the battle and the lab went wrong: prompts at {prompts}')
    r.mark('the lab: free, TREECKO in the party')

    # Out of the lab; west round Littleroot (clear of the wandering people);
    # north to Route 101's grass.
    r.wait(lambda: loc() == LAB and r.free(), 'free in the lab')
    r.walk('DOWN', 6)
    r.walk_into('DOWN', 'the lab door', lambda: loc() != LAB or r.fading())
    r.wait(lambda: loc() == LITTLEROOT and r.free(), 'out of the lab')
    r.mark('Littleroot: out of the lab')
    r.walk('DOWN', 1)
    r.walk('LEFT', 5)
    r.walk('UP', 9)
    r.walk('RIGHT', 9)
    r.walk('UP', 9)
    r.walk_into('UP', 'Route 101', lambda: loc() == ROUTE101)
    r.wait(r.free, 'Route 101')
    r.mark('Route 101 again')
    r.walk('UP', 4)
    r.walk('LEFT', 5)
    r.mark('Route 101: at the grass')

    # The grass: the legs walked without stopping, timed with encounters held
    # off, then played as a fixed schedule to the end whatever happens (in a
    # battle the directions do nothing). The script ends as long after the
    # last step as the ROM's battle takes from its encounter to its first
    # text, and TAIL more: an encounter on any step is on screen at the end.
    grass = r.save()
    legs = Recorder()
    legs.load(grass)
    legs.hook = lambda m: m.mem.u8.__setitem__(SYM['sWildEncounterImmunitySteps'], 0)
    legs.walk_legs(LEGS)
    schedule = {f: k for f, k in legs.inputs if f > grass[1]}
    last_step = max(schedule) + 8                  # the last step ends: its encounter check
    encounter, steps, pos = None, 0, r.xy()
    while not (encounter and r.in_battle() and r.text_waiting()):
        if r.f + 1 in schedule:
            r.set_keys(schedule[r.f + 1])
        r.step()
        if encounter is None:
            if r.xy() != pos:
                pos = r.xy()
                steps += pos[0] <= 5
            if r.in_battle() or r.cb2() != 'CB2_Overworld' or r.has_task('Task_BattleStart'):
                encounter = r.f
                r.marks.append((r.f - 1, f'Route 101: in the grass (step {steps} of {sum(n for _, n in LEGS)})'))
        if r.f > last_step + 1000:
            raise RuntimeError('no wild battle in the grass')
    text = r.f                                     # its first text box waits
    mon = SYM['gBattleMons'] + 0x58
    species, level = SPECIES.get(r.u16(mon), r.u16(mon)), r.u8(mon + 0x2A)
    end = max(last_step - encounter, 0) + text + TAIL
    while r.f < end:
        if r.f + 1 in schedule:
            r.set_keys(schedule[r.f + 1])
        r.step()
    r.marks += [(text + 10, f'wild battle: Wild {species} appeared! (Lv{level})'), (end, 'the end, in the wild battle')]
    inputs = [x for x in r.inputs if x[0] <= end]
    if inputs and inputs[-1][1]:
        inputs.append([end + 1, ''])
    return {'inputs': inputs, 'marks': sorted(r.marks), 'end': end, 'battle': s0, 'prompts': prompts,
            'encounter': encounter, 'before_battle': before_battle}


ABOUT = (
    "Pokémon Emerald's opening, from power-on to a wild battle in Route 101's grass: "
    "skip the intro, START at the title screen, NEW GAME, Birch's speech (BOY: Brendan), the naming screen (EMER), "
    "the truck, Mom, the house (upstairs: the wall clock, set at 10:00; downstairs: the TV), May's house (her mom, "
    "upstairs: May), north to Route 101 where a Zigzagoon chases Birch, the bag (TREECKO), the battle (POUND until the "
    "Zigzagoon faints), the lab (Birch gives the TREECKO; nickname: NO; 'go see MAY?': NO until a fixed frame, then YES), "
    "then out to Route 101's grass, left and right for 69 steps, and the end in the wild battle that starts there. "
    "Recorded on the ROM by platform/tests/opening.py, which explains the timing: every key a margin after the game "
    "waits for it; as the compiled game's RNG, and so its battles, can differ from the ROM's, from the battle to the "
    "lab a fixed schedule that takes any battle of up to 12 turns to the same frame (the ROM's takes 3), and in the "
    "grass every step walked whatever happens, the end late enough for a battle that starts on the last one. "
    "Checkpoints (frame: scene): {checkpoints}."
)


def write(result, path):
    marks = result['marks']
    shots = sorted({100, 300} | {f for f, _ in marks})
    script = {
        'about': ABOUT.format(checkpoints='; '.join(f'{f}: {n}' for f, n in marks)),
        'frames': result['end'],
        'time': TIME,
        'inputs': result['inputs'],
        'shots': [s for s in shots if s <= result['end']],
    }
    with open(path, 'w') as fh:
        json.dump(script, fh, indent=1, ensure_ascii=False)
        fh.write('\n')


# ---- --check: the script replayed with perturbations

# RNG values set just before the starter YES that give the longest battles
# found by sampling random ones (6-8 turns; 2845199087's Zigzagoon eats an
# ORAN BERRY).
LONG_SEEDS = [2845199087, 4001557567, 313697300, 2022542, 3355305989, 1263371380, 1249418419, 3909588191]


def perturbed(inputs, test):
    """A test's inputs, the RNG values it sets ({frame: value}, set before the
    frame runs) and the length it forces on the Zigzagoon battle:
      shift:X:D   the inputs from frame X on come D frames later
      jitter:S:N  each press (with its release) moved by up to S frames (seed N)
      rng:F:N     a random RNG value (seed N) at frame F
      seed:F:V    the RNG value V at frame F
      turns:N     the battle takes N turns: the Zigzagoon's HP kept full until
                  the Nth move is chosen, then 1 (TREECKO's kept full too)"""
    inputs = [list(x) for x in inputs]
    pokes, turns = {}, None
    for part in test.split('+'):
        kind, *args = part.split(':')
        if kind == 'shift':
            x, d = int(args[0]), int(args[1])
            inputs = [[f + d if f >= x else f, k] for f, k in inputs]
        elif kind == 'jitter':
            s, seed = int(args[0]), int(args[1])
            rnd = random.Random(seed)
            out, i = [], 0
            while i < len(inputs):
                f, k = inputs[i]
                if k and i + 1 < len(inputs) and inputs[i + 1][1] == '':
                    d = rnd.randint(-s, s)
                    out += [[f + d, k], [inputs[i + 1][0] + d, '']]
                    i += 2
                else:
                    out.append([f, k])
                    i += 1
            inputs = out
        elif kind == 'rng':
            pokes[int(args[0])] = random.Random(int(args[1])).getrandbits(32)
        elif kind == 'seed':
            pokes[int(args[0])] = int(args[1])
        elif kind == 'turns':
            turns = int(args[0])
    inputs.sort(key=lambda x: x[0])
    return inputs, pokes, turns


class Tracker:
    """What a replay does: its path, battles, the first battle's turns, the
    YES/NO boxes, the player at the end of the lab, the wild battle."""

    def __init__(self, s0):
        self.s0 = s0                  # the script's battle start (the base run's)
        self.path = []                # [frame, (mapGroup, mapNum, x, y)] at each move
        self.battles = []
        self.was = False
        self.renamed = False
        self.turns = 0
        self.last_move = None
        self.ctrl = None
        self.prompts = []
        self.was_yesno = False
        self.lab = None

    def observe(self, g, f):
        """Returns True on the frame a move is chosen in the first battle."""
        b = g.in_battle()
        if b and not self.was:
            self.battles.append(f)
        self.was = b
        chose = False
        if b and len(self.battles) == 1:
            c = g.controller()
            if self.ctrl == 'HandleInputChooseMove' and c != self.ctrl:
                self.turns += 1
                self.last_move = f
                chose = True
            self.ctrl = c
        if f % 2:
            return chose
        cb2 = g.cb2()
        if cb2 == 'CB2_Overworld':
            p = g.loc() + g.xy()
            if not self.path or p != self.path[-1][1]:
                self.path.append([f, p])
        self.renamed |= cb2 == 'CB2_NamingScreen' and f > 8000
        if self.battles and f > self.battles[0]:
            y = g.yesno()
            if y and not self.was_yesno:
                self.prompts.append(f)
            self.was_yesno = y
        if self.s0 and f == self.s0 + TAP + 40 + (self.s0 + TAP + 40) % 2:     # after the DOWN tap
            o = SYM['gObjectEvents'] + g.u8(SYM['gPlayerAvatar'] + 5) * 0x24
            self.lab = (g.loc() == LAB, g.xy(), g.u8(o + 0x18) & 0xF, g.overworld_free())
        return chose

    def result(self, g):
        mon = SYM['gBattleMons'] + 0x58
        wild = self.battles[1] if len(self.battles) > 1 else None
        grass = next((f for f, p in self.path if p == ROUTE101 + (6, 15) and f > (self.s0 or 0)), None)
        return {'path': self.path, 'battles': self.battles, 'renamed': self.renamed, 'turns': self.turns,
                'last_move': self.last_move, 'prompts': self.prompts, 'lab': self.lab, 'wild': wild,
                'grass_steps': sum(1 for f, _ in self.path if grass and grass < f < (wild or 1 << 30)),
                'end_in_wild_battle': bool(wild) and g.in_battle(), 'end_text': g.text_waiting(),
                'wild_mon': (SPECIES.get(g.u16(mon), g.u16(mon)), g.u8(mon + 0x2A)) if wild and g.in_battle() else None}


def first_change(base, test):
    """The first frame at which a test's keys can differ from the base's."""
    a, b = {tuple(x) for x in base}, {tuple(x) for x in test}
    return min((f for f, _ in a ^ b), default=None)


def replay(args):
    script, test, start, s0 = args
    inputs, pokes, force = perturbed(script['inputs'], test)
    table = {f: k for f, k in inputs}
    g = Rom()
    t = Tracker(s0)
    if start:
        state, tracker = start
        g.load(state)
        t = copy.deepcopy(tracker)
        t.s0 = s0
    mon = SYM['gBattleMons']
    for f in range(g.f + 1, script['frames'] + 1):
        if f in table:
            g.keys = table[f]
        if f in pokes:
            g.mem.u32[SYM['gRngValue']] = pokes[f]
        g.run_frame()
        if t.observe(g, f) and force:
            enemy = mon + 0x58
            g.mem.u16[enemy + 0x28] = 1 if t.turns >= force else g.u16(enemy + 0x2C)
            g.mem.u16[mon + 0x28] = g.u16(mon + 0x2C)
    return test, t.result(g)


def base_run(script, starts):
    """The script unperturbed, from power-on; the game and the tracker saved
    before each frame in starts, and as the battle starts ('battle')."""
    table = {f: k for f, k in script['inputs']}
    g = Rom()
    t = Tracker(None)
    saved = {}
    for f in range(1, script['frames'] + 1):
        if f in starts:
            saved[f] = (g.save(), copy.deepcopy(t))
        if f in table:
            g.keys = table[f]
        g.run_frame()
        t.observe(g, f)
        if t.s0 is None and t.battles:
            t.s0 = t.battles[0]
            saved['battle'] = (g.save(), copy.deepcopy(t))
    return t.result(g), t.s0, saved


def check(path, groups, workers, n_random):
    script = json.load(open(path))
    marks = [c.split(': ', 1) for c in script['about'].split('Checkpoints (frame: scene): ')[1].rstrip('.').split('; ')]
    marks = [(int(f), n) for f, n in marks]
    named = next(f for f, n in marks if n.startswith("so it's"))           # the RNG is seeded just before
    confirm = next(f for f, n in marks if n.startswith('TREECKO: do you choose'))
    yes = min(f for f, k in script['inputs'] if k == 'A' and f > confirm)  # the starter YES
    tests = []
    if 'battles' in groups:                      # the battle's length
        tests += [f'turns:{n}' for n in range(1, NPAIRS - 1)]
        tests += [f'seed:{yes}:{v}' for v in LONG_SEEDS]
        tests += [f'rng:{yes}:{100 + s}' for s in range(n_random)]
    if 'rng' in groups:                          # another seed from the naming screen on (as another timer reading)
        tests += [f'rng:{named + 60}:{s}' for s in range(n_random)]
    if 'timing' in groups:
        tests += [f'shift:1:{d}' for d in (-3, -2, -1, 1, 2, 3)]
        tests += [f'shift:{f}:{d}' for f, _ in marks[2:-2:6] for d in (-2, 2)]
        tests += [f'jitter:2:{s}' for s in range(3)]
    # Each test starts from the base run's state at its first change (a
    # forced battle length at the battle's first frame).
    firsts = {}
    for test in tests:
        inputs, pokes, _ = perturbed(script['inputs'], test)
        firsts[test] = min([x for x in (first_change(script['inputs'], inputs), min(pokes, default=None)) if x],
                           default=None)
    base, s0, saved = base_run(script, {f for f in firsts.values() if f})
    for test in tests:
        if test.startswith('turns'):
            firsts[test] = 'battle'
    print(f'base: battle at {s0} ({base["turns"]} turns), YES/NO at {base["prompts"]}, wild battle at {base["wild"]} '
          f'(grass step {base["grass_steps"]}, {base["wild_mon"]}); starter YES at {yes}; {len(tests)} tests', flush=True)
    ref = [p for _, p in base['path']]
    ref = ref[:ref.index(ROUTE101 + (6, 15), ref.index(LAB + (6, 5))) + 1]
    bad = 0
    with multiprocessing.Pool(workers) as pool:
        results = pool.imap_unordered(replay, [(script, t, saved.get(firsts[t]), s0) for t in tests])
        for t, r in results:
            bad += not report(t, r, ref, s0)
    print('all runs follow the script' if not bad else f'{bad} run(s) went astray')
    return 1 if bad else 0


def report(t, r, ref, s0):
    """Prints a run's line; whether it followed the script (the same path to
    the grass, no nickname, a wild battle with its text on screen at the end)."""
    p = [q for _, q in r['path']]
    same = p[:len(ref)] == ref
    ok = same and not r['renamed'] and r['end_in_wild_battle'] and r['end_text']
    lab = r['lab'] or (False, None, None, False)
    print(f"{'ok ' if ok else 'BAD'} {t:20s} {r['turns']} turns (last move chosen at {r['last_move'] and r['last_move'] - s0}), "
          f"YES/NO at {[f - s0 for f in r['prompts']][:4]}, nickname screen {'YES' if r['renamed'] else 'no'}, "
          f"then {'in the lab' if lab[0] else 'NOT in the lab'} at {lab[1]} facing {FACING.get(lab[2])}{'' if lab[3] else ' NOT'} free; "
          f"path {'same' if same else 'DIFFERS'}; wild battle at {r['wild']} (grass step {r['grass_steps']}, {r['wild_mon']})"
          f"{', in it at the end' if r['end_in_wild_battle'] else ', NOT REACHED'}", flush=True)
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', nargs='*', choices=['timing', 'rng', 'battles'],
                    help='replay the script perturbed instead of recording it (default: every group)')
    ap.add_argument('--random', type=int, default=6, help='--check: random RNG values per group')
    ap.add_argument('--workers', type=int, default=3)
    ap.add_argument('--out', default=OUT)
    args = ap.parse_args()
    if args.check is not None:
        sys.exit(check(args.out, args.check or ['timing', 'rng', 'battles'], args.workers, args.random))
    result = record()
    write(result, args.out)
    print(f"{result['end']} frames, {len(result['inputs'])} inputs, {len(result['marks'])} checkpoints; "
          f"battle from {result['battle']}, YES/NO at {result['prompts']}, wild battle from {result['encounter']}; {args.out}")


if __name__ == '__main__':
    main()
