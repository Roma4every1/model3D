import type { SlideButtonPayload } from '../lib/slide.types';
import { useClientStore } from 'entities/client';

import {
  useProgramStore, ProgramFactory,
  initializeProgram, prepareProgram, runProgram, setClientPrograms,
} from 'entities/program';


export async function handleSlideAction(id: FormID, payload: SlideButtonPayload): Promise<true | void> {
  let programs = useProgramStore.getState().models[id];
  if (!programs) programs = await initSlidePrograms(id);

  const callback = (p: Program): boolean => p.id.endsWith(payload.program);
  let program = programs.find(callback);
  if (!program) return;

  if (program.parameters) {
    await prepareProgram(program);
  } else {
    await initializeProgram(program, useClientStore.getState()[id].parent);
  }
  programs = useProgramStore.getState().models[id];
  program = programs.find(callback);

  if (payload.values) {
    setBindingValues(program, payload.values);
  }
  if (program.parameters.some(p => p.editor)) {
    return true;
  } else {
    await runProgram(program);
  }
}

async function initSlidePrograms(id: FormID): Promise<Program[]> {
  const factory = new ProgramFactory(id);
  const programs = await factory.create();
  setClientPrograms(id, programs);
  return programs;
}

function setBindingValues(program: Program, values: Record<ParameterName, string>): void {
  for (const name in values) {
    const parameter = program.parameters.find(p => p.name === name);
    if (parameter) parameter.setValueString(values[name]);
  }
}
