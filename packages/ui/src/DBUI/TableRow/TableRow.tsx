import { Label, styled, XStack, YStack } from 'tamagui'
import { Key as KeyIcon } from "@tamagui/lucide-icons";

export const StyledDBTableRow = styled(XStack, {
  name: 'DBTableRow',
  bc: '$gray1',
  borderRadius: "$1",
  paddingVertical: "$2",
  paddingHorizontal: "$5",
  space: "$3",
  alignItems: 'center',
  minWidth: 300,

  variants: {
    primaryKey: {
      true: {
        bc: '$blue4Dark',
      },
    },
  } as const,
})

interface IDbTableRowProps {
  primaryKey?: boolean
  referencesTable?: string
}
export const DBTableRow: React.FC<IDbTableRowProps> = (props) => {
  return (
    <StyledDBTableRow {...props}>
      <YStack width={"100%"}>
        <XStack w={"100%"} justifyContent='space-between' alignItems="center" space={"$2"}>
          {
            props.primaryKey && (
              <KeyIcon color={"white"} height={25} />
            )
          }
          <XStack justifyContent='space-between' flex={1}>
            {/* @ts-ignore */}
            {props.children}
          </XStack>
        </XStack>
        {props.referencesTable && (
          <DBTableRowLabel subtitle={true} fontSize={"$2"}>FK: {props.referencesTable}</DBTableRowLabel>
        )}
      </YStack>
    </StyledDBTableRow>
  )
}

export const DBTableRowLabel = styled(Label, {
  name: 'DBTableRowLabel',
  color: '$gray6Light',
  fontWeight: 'bold',
  fontSize: "$5",

  variants: {
    subtitle: {
      true: {
        fontSize: "$5",
        color: '$gray10Dark',
        fontWeight: 'normal',
      },
    }
  } as const,
})