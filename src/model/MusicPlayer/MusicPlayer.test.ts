import * as fc from 'fast-check';

import { MusicPlayer, MusicPlayerA, MusicPlayerB } from './MusicPlayer';

class MusicPlayerModel {
  isPlaying: boolean = false;
  numTracks: number = 0;
  tracksAlreadySeen: { [Key: string]: boolean } = {}; // our model forbid to append twice the same track
}

type MusicPlayerCommand = fc.Command<MusicPlayerModel, MusicPlayer>;

class PlayCommand implements MusicPlayerCommand {
  check(m: MusicPlayerModel) {
    return true;
  }
  run(m: MusicPlayerModel, p: MusicPlayer) {
    p.play();
    m.isPlaying = true;
    expect(p.playing()).toBeTruthy();
  }
  toString() {
    return 'Play';
  }
}

class PauseCommand implements MusicPlayerCommand {
  check(m: MusicPlayerModel) {
    return true;
  }
  run(m: MusicPlayerModel, p: MusicPlayer) {
    p.pause();
    m.isPlaying = false;
    expect(p.playing()).toBeFalsy();
  }
  toString() {
    return 'Pause';
  }
}

class NextCommand implements MusicPlayerCommand {
  check(m: MusicPlayerModel) {
    return true;
  }
  run(m: MusicPlayerModel, p: MusicPlayer) {
    const trackBefore = p.currentTrackName();
    p.next();
    expect(p.playing()).toBe(m.isPlaying);
    if (m.numTracks === 1) {
        expect(p.currentTrackName()).toBe(trackBefore);
    } else {
       expect(p.currentTrackName()).not.toBe(trackBefore);
    }
  }
  toString() {
    return 'Next';
  }
}

class AddTrackCommand implements MusicPlayerCommand {
  constructor(readonly position: number, readonly trackName: string) {}
  check(m: MusicPlayerModel) {
    return !m.tracksAlreadySeen[this.trackName];
  }
  run(m: MusicPlayerModel, p: MusicPlayer) {
    const trackBefore = p.currentTrackName();
    p.addTrack(this.trackName, this.position % (m.numTracks + 1)); // old model
    expect(p.playing()).toBe(m.isPlaying);
    expect(p.currentTrackName()).toBe(trackBefore);
    ++m.numTracks;
    m.tracksAlreadySeen[this.trackName] = true;
  }
  toString() {
    return `AddTrack(${this.position}, "${this.trackName}")`;
  }
}

describe('MusicPlayer', () => {
  const TrackNameArb = fc.hexaString(1, 10);
  const CommandsArb = fc.commands([
    fc.constant(new PlayCommand()),
    fc.constant(new PauseCommand()),
    fc.constant(new NextCommand()),
    fc.record({ position: fc.nat(), trackName: TrackNameArb }).map(d => new AddTrackCommand(d.position, d.trackName))
  ]);
  // it('should run fast-check on model based approach against MusicPlayerA', () =>
  //   fc.assert(
  //     fc.property(fc.set(TrackNameArb, 1, 10), CommandsArb, (initialTracks, commands) => {
  //       const real = new MusicPlayerA(initialTracks);
  //       const model = new MusicPlayerModel();
  //       model.numTracks = initialTracks.length;
  //       for (const t of initialTracks) {
  //         model.tracksAlreadySeen[t] = true;
  //       }
  //       fc.modelRun(() => ({ model, real }), commands);
  //     }),
  //     { verbose: true }
  //   ));
  it('should run fast-check on model based approach against MusicPlayerB', () =>
    fc.assert(
      fc.property(fc.set(TrackNameArb, 1, 10), CommandsArb, (initialTracks, commands) => {
        const real = new MusicPlayerB(initialTracks);
        const model = new MusicPlayerModel();
        model.numTracks = initialTracks.length;
        for (const t of initialTracks) {
          model.tracksAlreadySeen[t] = true;
        }
        fc.modelRun(() => ({ model, real }), commands);
      })
    ));
});
