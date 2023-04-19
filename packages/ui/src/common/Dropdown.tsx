import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { Adapt, Select, Sheet, YStack } from 'tamagui'
// import { LinearGradient } from 'tamagui/linear-gradient'

interface IItem {
  name: string
}

interface IProps {
  items: IItem[]
  onSelect: (item: IItem) => void
  placeholder?: string
  label?: string
}

export const Dropdown: React.FC<IProps> = ({
  items = [],
  onSelect = () => {},
  placeholder = 'Select',
  label = '',
}) => {
  const [selectedItem, setSelectedItem] = useState<IItem>()

  useEffect(() => {
    if (selectedItem) {
      onSelect(selectedItem)
    }
  }, [selectedItem])

  return (
    <Select value={selectedItem?.name} onValueChange={(v) => setSelectedItem(
      items.find((item) => item.name === v)
    )}>
      <Select.Trigger width={180} iconAfter={ChevronDown}>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
          <YStack zIndex={10}>
            <ChevronUp size={20} />
          </YStack>
        </Select.ScrollUpButton>

        <Select.Viewport minWidth={200}>
          <Select.Group space="$0">
            <Select.Label>{label}</Select.Label>
            {items.map((item, i) => {
              return (
                <Select.Item index={i} key={item.name} value={item.name.toLowerCase()}>
                  <Select.ItemText>{item.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              )
            })}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
          <YStack zIndex={10}>
            <ChevronDown size={20} />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  )
}