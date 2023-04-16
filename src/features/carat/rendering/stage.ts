import { CaratTrack } from './track';


interface ICaratStage {
  resize(): void
  render(): void
}


/** Сцена диаграммы. */
export class CaratStage implements ICaratStage {
  private readonly tracks: CaratTrack[];

  constructor(tracks: CaratTrack[]) {
    this.tracks = tracks;
  }

  public resize() {

  }

  public render() {
    for (const track of this.tracks) track.render();
  }
}
