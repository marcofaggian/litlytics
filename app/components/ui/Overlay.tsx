import { Pipeline } from '@/src/pipeline/Pipeline';
import {
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  Cog8ToothIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '~/components/catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '~/components/catalyst/dialog';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownShortcut,
} from '~/components/catalyst/dropdown';
import {
  emptyPipeline,
  litlyticsConfigStore,
  pipelineAtom,
  pipelineStatusAtom,
  pipelineUndoAtom,
  webllmAtom,
} from '~/store/store';
import { Field, FieldGroup, Label } from '../catalyst/fieldset';
import { Input } from '../catalyst/input';
import { GithubIcon } from './GithubIcon';
import { Help } from './Help';
import { Settings } from './Settings';

// first time help display
const helpAtom = atomWithStorage('litlytics.help.first', true, undefined, {
  getOnInit: true,
});

function MenuHolder({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`w-fit h-fit bg-transparent p-1.5 gap-1.5 isolate inline-flex rounded-lg shadow-sm pointer-events-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function OverlayUI() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipeline, setPipeline] = useAtom(pipelineAtom);
  const setStatus = useSetAtom(pipelineStatusAtom);
  const litlyticsConfig = useAtomValue(litlyticsConfigStore);
  const webllm = useAtomValue(webllmAtom);
  const { undo, redo, canUndo, canRedo } = useAtomValue(pipelineUndoAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpFirstTime, setHelpFirstTime] = useAtom(helpAtom);

  useEffect(() => {
    if (isHelpFirstTime) {
      setIsHelpOpen(true);
    }
  }, [isHelpFirstTime]);

  useEffect(() => {
    // show settings if key not set
    if (
      !litlyticsConfig.modelConfig.apiKey?.length &&
      webllm.loadProgress !== 1
    ) {
      setIsSettingsOpen(true);
    }
  }, [litlyticsConfig, webllm]);

  const closeHelp = () => {
    setIsHelpOpen(false);
    if (isHelpFirstTime) {
      setHelpFirstTime(false);
    }
  };

  const resetPipeline = () => {
    setPipeline(structuredClone(emptyPipeline));
    setStatus({ status: 'init' });
    setIsOpen(false);
  };

  const savePipeline = () => {
    const pipelineToSave = structuredClone(pipeline);
    // set model and provider
    pipelineToSave.provider = litlyticsConfig.modelConfig.provider;
    pipelineToSave.model = litlyticsConfig.modelConfig.model;
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(pipeline, null, 2);
    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pipeline.name}.json`;
    // Programmatically click the anchor to trigger the download
    a.click();
    // Clean up: revoke the object URL
    URL.revokeObjectURL(url);
    // close modal
    setIsSaveOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string) as Pipeline;
          setPipeline(json);
          setStatus({ status: 'init' });
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const closeSettings = () => {
    // disallow closing if no key set
    if (
      !litlyticsConfig.modelConfig.apiKey?.length &&
      webllm.loadProgress !== 1
    )
      return;

    setIsSettingsOpen(false);
  };

  // add hotkeys hooks
  useHotkeys('ctrl+z, command+z', undo, [undo]);
  useHotkeys('ctrl+y, command+y', redo, [redo]);

  return (
    <div className="fixed pointer-events-none my-6 px-4 z-10 h-screen w-screen bg-transparent">
      <div className="flex justify-between w-full h-fit">
        <MenuHolder>
          <Dropdown>
            <DropdownButton>
              <Bars3Icon />
            </DropdownButton>
            <DropdownMenu
              className="min-w-80 lg:min-w-64"
              anchor="bottom start"
            >
              <DropdownItem onClick={() => setIsOpen(true)}>
                <TrashIcon aria-hidden="true" className="h-5 w-5" />
                <DropdownLabel>Reset pipeline</DropdownLabel>
              </DropdownItem>

              <DropdownDivider />

              <DropdownItem onClick={() => fileInputRef.current?.click()}>
                <FolderIcon aria-hidden="true" className="h-5 w-5" />
                <DropdownLabel>Open pipeline</DropdownLabel>
              </DropdownItem>

              <DropdownItem onClick={() => setIsSaveOpen(true)}>
                <ArrowDownTrayIcon aria-hidden="true" className="h-5 w-5" />
                <DropdownLabel>Save pipeline</DropdownLabel>
              </DropdownItem>

              <DropdownDivider />

              <DropdownItem
                onClick={undo}
                disabled={!canUndo}
                className="disabled:opacity-30"
              >
                <ArrowUturnLeftIcon aria-hidden="true" className="h-5 w-5" />
                <DropdownLabel>Undo</DropdownLabel>
                <DropdownShortcut keys="⌃Z" />
              </DropdownItem>

              <DropdownItem
                onClick={redo}
                disabled={!canRedo}
                className="disabled:opacity-30"
              >
                <ArrowUturnRightIcon aria-hidden="true" className="h-5 w-5" />
                <DropdownLabel>Redo</DropdownLabel>
                <DropdownShortcut keys="⌃Y" />
              </DropdownItem>

              <DropdownDivider />

              <DropdownItem onClick={() => setIsSettingsOpen(true)}>
                <Cog8ToothIcon />
                <DropdownLabel>Settings</DropdownLabel>
              </DropdownItem>

              <DropdownDivider />

              <DropdownItem
                href="https://github.com/yamalight/litlytics"
                target="_blank"
              >
                <GithubIcon className="w-3 h-3" />
                <DropdownLabel>Github</DropdownLabel>
              </DropdownItem>

              <DropdownItem onClick={() => setIsHelpOpen(true)}>
                <QuestionMarkCircleIcon />
                <DropdownLabel>Help</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </MenuHolder>
      </div>

      {/* Pipeline reset dialog */}
      <Dialog size="3xl" open={isOpen} onClose={setIsOpen} topClassName="z-20">
        <DialogTitle>Reset pipeline?</DialogTitle>
        <DialogBody className="w-full">
          Are you sure you want to reset the pipeline? This will delete all
          current steps and docs.
        </DialogBody>
        <DialogActions className="flex justify-between">
          <Button color="red" onClick={resetPipeline}>
            Yes, reset
          </Button>
          <Button plain onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pipeline save dialog */}
      <Dialog
        size="xl"
        open={isSaveOpen}
        onClose={setIsSaveOpen}
        topClassName="z-20"
      >
        <DialogTitle>Save pipeline?</DialogTitle>
        <DialogBody className="w-full">
          <FieldGroup>
            <Field>
              <Label>Name</Label>
              <Input
                name="name"
                placeholder="Pipeline name"
                autoFocus
                value={pipeline.name}
                onChange={(e) =>
                  setPipeline({ ...pipeline, name: e.target.value })
                }
              />
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogActions className="flex justify-between">
          <Button plain onClick={() => setIsSaveOpen(false)}>
            Close
          </Button>
          <Button color="green" onClick={savePipeline}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings dialog */}
      <Dialog
        size="2xl"
        open={isSettingsOpen}
        onClose={closeSettings}
        canClose={
          Boolean(litlyticsConfig.modelConfig.apiKey?.length) ||
          webllm.loadProgress === 1
        }
        topClassName="z-20"
      >
        <DialogTitle className="!text-lg">Settings</DialogTitle>
        <DialogBody className="w-full">
          <Settings close={closeSettings} />
        </DialogBody>
      </Dialog>

      {/* Help dialog */}
      <Dialog
        size="2xl"
        open={isHelpOpen}
        onClose={closeHelp}
        topClassName="z-40"
      >
        <DialogTitle className="!text-lg">
          Welcome to 🔥 LitLytics – Your Automated Data Analytics Companion!
        </DialogTitle>
        <DialogBody className="w-full">
          <Help />
        </DialogBody>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </div>
  );
}
