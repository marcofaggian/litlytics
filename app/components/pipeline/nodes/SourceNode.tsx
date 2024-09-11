import { SourceType, SourceTypes } from '@/src/source/Source';
import { SourceStep } from '@/src/step/Step';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  EllipsisHorizontalIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/solid';
import { useAtom, useAtomValue } from 'jotai';
import { ChangeEvent, useMemo, useState } from 'react';
import { Button } from '~/components/catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '~/components/catalyst/dialog';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '~/components/catalyst/dropdown';
import { Field, FieldGroup, Label } from '~/components/catalyst/fieldset';
import { Select } from '~/components/catalyst/select';
import { Spinner } from '~/components/Spinner';
import { pipelineAtom, pipelineStatusAtom } from '~/store/store';
import { DocsListSource } from '../source/docs/DocsList';
import { TextSource } from '../source/text/TextSource';
import { SourceRender } from '../source/types';
import { NodeContent, NodeFrame, NodeHeader } from './NodeFrame';

const SOURCE_RENDERERS: Partial<Record<SourceType, SourceRender>> = {
  [SourceTypes.DOCS]: DocsListSource,
  [SourceTypes.TEXT]: TextSource,
  // [SourceTypes.FILES]: DocsListSource,
};

export function SourceNode() {
  const [isOpen, setIsOpen] = useState(false);
  const [pipeline, setPipeline] = useAtom(pipelineAtom);
  const { status } = useAtomValue(pipelineStatusAtom);

  const data = useMemo(() => pipeline.source, [pipeline]);
  const Render = useMemo(() => {
    if (!data) {
      return;
    }
    return SOURCE_RENDERERS[data.sourceType];
  }, [data]);

  const updateNodeByKey = (
    newVal: string | boolean | undefined,
    prop: keyof SourceStep
  ) => {
    const newData = structuredClone(data!);
    newData[prop] = newVal;

    const newPipeline = {
      ...pipeline,
      source: newData,
    };

    // clear docs when changing source type
    if (prop === 'sourceType') {
      newData.config = {};
      newPipeline.testDocs = [];
    }

    setPipeline(newPipeline);
  };

  const updateNode = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    prop: keyof SourceStep
  ) => {
    const newVal = e.target.value;
    updateNodeByKey(newVal, prop);
  };

  if (!data) {
    return <></>;
  }

  return (
    <>
      {/* Source node render */}
      <NodeFrame
        hasConnector={pipeline.steps.length > 0 ? true : 'auto'}
        currentStep={data}
        size={data.expanded ? 'lg' : 'collapsed'}
      >
        <NodeHeader collapsed={!data.expanded}>
          <div className="flex flex-1 gap-2 items-center">
            {status === 'sourcing' ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <Button
                icon
                className="!p-0"
                onClick={() => updateNodeByKey(!data.expanded, 'expanded')}
              >
                {data.expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </Button>
            )}
            <RectangleStackIcon className="w-4 h-4" /> Source
          </div>
          <div className="flex items-center">
            <Dropdown>
              <DropdownButton plain>
                <EllipsisHorizontalIcon />
              </DropdownButton>
              <DropdownMenu>
                <DropdownItem onClick={() => setIsOpen(true)}>
                  <CogIcon /> Configure
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </NodeHeader>
        {data.expanded ? (
          <NodeContent className="h-[calc(100%-2rem)]">
            {Render && <Render data={data} />}
          </NodeContent>
        ) : (
          <></>
        )}
      </NodeFrame>

      {/* Source config */}
      <Dialog open={isOpen} onClose={setIsOpen} topClassName="z-20">
        <DialogTitle>Configure {data.name}</DialogTitle>
        <DialogDescription>
          Configure parameters for source node: {data.name}
        </DialogDescription>
        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>Source type</Label>
              <Select
                name="step-input"
                value={data.sourceType as string}
                onChange={(e) => updateNode(e, 'sourceType')}
              >
                {Object.keys(SourceTypes).map((type) => (
                  <option
                    key={type}
                    value={SourceTypes[type as keyof SourceTypes]}
                  >
                    {SourceTypes[type as keyof SourceTypes]}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
