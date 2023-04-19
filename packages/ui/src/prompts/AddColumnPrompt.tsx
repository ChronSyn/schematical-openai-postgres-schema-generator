import { X } from '@tamagui/lucide-icons'
import {
  Adapt,
  Button,
  Dialog,
  Fieldset,
  H2,
  Input,
  Label,
  Paragraph,
  Sheet,
  TooltipSimple,
  Unspaced,
  YStack,
} from 'tamagui'
import { Dropdown } from '../common/Dropdown'
import { useState } from 'react'
import { Plus as AddIcon } from "@tamagui/lucide-icons";
import React from 'react';

type TDataType = 'text' | 'int2' | 'int4' | 'int8' | 'boolean' | 'timestamp' | 'uuid' | 'jsonb'

interface IOnSaveArgs {
  name: string
  type: TDataType
}

interface IProps {
  onSave: (data: IOnSaveArgs) => boolean
  targetTable: string
}

export const AddColumnPrompt: React.FC<IProps> = ({
  onSave = () => {},
  targetTable,
}) => {
  if (!targetTable) {
    return null
  }

  const [dataType, setDataType] = useState<TDataType>()
  const [name, setName] = useState<string>('')
  let dialogRef = React.createRef<typeof Dialog>()

  return (
    // @ts-ignore
    <Dialog modal ref={dialogRef}>
      <Dialog.Trigger asChild>
      <Button
        justifyContent='flex-start'
        alignItems={"center"}
        backgroundColor={"$green8"}
        marginTop={"$2"}
        borderTopLeftRadius={"$2"}
        borderTopRightRadius={"$2"}
        borderBottomLeftRadius={"$5"}
        borderBottomRightRadius={"$5"}
      >
        <AddIcon size={25} color='white'/>
        <Label fontSize={"$5"} color={"white"}>Add column</Label>
      </Button>
      </Dialog.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" space>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          space
        >
          <Dialog.Title>Add Column</Dialog.Title>
          <Fieldset space="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Name
            </Label>
            <Input flex={1} id="name" defaultValue={name} value={name} onChangeText={setName} />
          </Fieldset>
          <Fieldset space="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="username">
              <TooltipSimple label="Select the data type for this field" placement="bottom-start">
                <Paragraph>Data type</Paragraph>
              </TooltipSimple>
            </Label>
            <Dropdown
              items={[
                { name: 'text' },
                { name: 'int2' },
                { name: 'int4' },
                { name: 'int8' },
                { name: 'boolean' },
                { name: 'timestamp' },
                { name: 'uuid' },
                { name: 'jsonb' },
              ]}
              onSelect={(item) => {
                setDataType(item?.name as TDataType)
              }}
              label='Data type'
              placeholder="Data type"
            />
          </Fieldset>

          <YStack alignItems="flex-end" marginTop="$2">
            <Button theme="alt1" aria-label="Close" onPress={() => {
              if (!name || !dataType) {
                alert('Please fill in the name and select a data type')
                return
              }
              const result = onSave({ name, type: dataType! })
              if (result) {
                // @ts-ignore
                dialogRef.current?.open(false)
              }
            }}>
              Save changes
            </Button>
          </YStack>

          <Unspaced>
            <Dialog.Close asChild>
              <Button position="absolute" top="$3" right="$3" size="$2" circular icon={X} />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

