import { LitLytics } from '@/src/litlytics';
import { ModelConfig } from '@/src/llm/types';
import { Pipeline, PipelineStatus } from '@/src/pipeline/Pipeline';
import { MLCEngine } from '@mlc-ai/web-llm';
import { atom } from 'jotai';
import { withUndo } from 'jotai-history';
import { atomWithStorage } from 'jotai/utils';

export const emptyPipeline: Pipeline = {
  // project setup
  name: '',
  // pipeline plan
  pipelinePlan: '',
  pipelineDescription: '',
  // pipeline source
  source: {
    id: 'source_0',
    name: 'Source',
    description: 'Primary source',
    type: 'source',
    sourceType: 'text',
    config: {},
    connectsTo: [],
    expanded: true,
  },
  // pipeline output
  output: {
    id: 'output_0',
    name: 'Output',
    description: 'Primary output',
    type: 'output',
    outputType: 'basic',
    config: {},
    connectsTo: [],
    expanded: true,
  },
  // pipeline steps
  steps: [],
};

export const litlyticsConfigStore = atomWithStorage<{
  modelConfig: ModelConfig;
}>(
  'litltyics.config',
  {
    modelConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
    },
  },
  undefined,
  { getOnInit: true }
);
export const litlyticsStore = atom<LitLytics>(
  new LitLytics({
    modelConfig: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
    },
  })
);

export const pipelineStatusAtom = atom<PipelineStatus>({
  status: 'init',
});

export const pipelineAtom = atomWithStorage<Pipeline>(
  'litlytics.pipeline',
  emptyPipeline,
  undefined,
  { getOnInit: true }
);
export const pipelineUndoAtom = withUndo(pipelineAtom, 10);

export const webllmAtom = atom<{
  engine?: MLCEngine;
  fetchProgress: number;
  loadProgress: number;
  status: string;
}>({
  engine: undefined,
  fetchProgress: -1,
  loadProgress: -1,
  status: '',
});
