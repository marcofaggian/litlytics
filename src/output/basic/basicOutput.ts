import { Doc } from '@/src/doc/Document';
import { Pipeline } from '@/src/pipeline/Pipeline';
import React from 'react';
import { OutputProvider, Result } from '../Output';
import { BasicOutputRender } from './BasicOutputRender';
import { BasicOutputConfig } from './types';

export class BasicOutput implements OutputProvider {
  pipeline: Pipeline;

  constructor(pipeline: Pipeline) {
    this.pipeline = pipeline;
  }

  getConfig() {
    return this.pipeline.output.config as BasicOutputConfig;
  }

  saveResults(docs: Doc[]) {
    const config = this.getConfig();
    config.results = docs;
  }

  getResult() {
    const docs = this.getConfig().results;
    if (!docs) {
      throw new Error('No docs to extract results from!');
    }

    const results: Doc[] = Array.isArray(docs) ? docs : [docs];
    // get all docs that have been processed by last step
    const res = results
      .filter((doc) => doc)
      .map((doc) => {
        const d = structuredClone(doc);
        d.processingResults = d.processingResults.filter((r) => {
          const steps = this.pipeline.steps.filter(
            (s) =>
              s.id === r.stepId &&
              s.connectsTo.includes(this.pipeline.output.id)
          );
          return steps.length > 0;
        });
        return d;
      });

    // if there are no results - throw an error
    if (!res?.length) {
      throw new Error('No output results!');
    }

    // map processing results to self-contained doc results
    const final: Result[] = res
      .map((doc) =>
        doc.processingResults.map(
          (p) =>
            ({
              ...p,
              doc,
            } as Result)
        )
      )
      .flat();
    return final;
  }

  render({
    pipeline,
    setPipeline,
  }: {
    pipeline: Pipeline;
    setPipeline: (newPipe: Pipeline) => void;
  }) {
    return React.createElement(BasicOutputRender, {
      pipeline,
      setPipeline,
    });
  }
}
