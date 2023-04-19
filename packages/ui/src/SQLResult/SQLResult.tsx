import { X } from '@tamagui/lucide-icons'
import {
  Adapt,
  Button,
  Dialog,
  Fieldset,
  Input,
  ScrollView,
  Sheet,
  Spinner,
  Unspaced,
} from 'tamagui'
import React from 'react';

type TDataType = 'text' | 'int2' | 'int4' | 'int8' | 'boolean' | 'timestamp' | 'uuid' | 'jsonb'

interface IProps {
  sqlText: string
  openButton?: React.ReactNode
  isLoading?: boolean
}

export const SQLResultPanel: React.FC<IProps> = ({
  sqlText = '',
  openButton = null,
  isLoading = true,
}) => {
  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        {openButton}
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
          width={"50%"}
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
          <Dialog.Title>SQL for schema</Dialog.Title>
          {isLoading && <Spinner size='large' color={'$orange10'} />}
          {!isLoading && (
            <Fieldset space="$4" horizontal>
              <ScrollView width={"100%"} justifyContent="flex-end">
                <Input
                  width={"100%"}
                  multiline={true}
                  height={300}
                  numberOfLines={30}
                  value={sqlText}
                  onChangeText={() => {
                    return
                  }}
                />
              </ScrollView>
            </Fieldset>
          )}

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

