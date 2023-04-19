import { Anchor, Button, H1, Paragraph, Separator, Sheet, XStack, YStack, useToast, Input, H3, Label, Spinner, H6 } from '@my/ui'
import { DBTableRow, DBTableRowLabel } from '@my/ui/src/DBUI/TableRow/TableRow'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import React, { useMemo, useState } from 'react'
import { useDebouncedCallback } from "use-debounce"
import { AddColumnPrompt } from '@my/ui/src/prompts/AddColumnPrompt'
import { SQLResultPanel } from '@my/ui/src/SQLResult/SQLResult'


interface ISuggestTableResponseTableColumn {
  name: string
  type: string
  primary_key?: boolean | null
  foreign_key?: boolean | null
  references?: string | null
  default?: string | null
}

interface ISuggestTableResponseTable {
  name: string
  columns: ISuggestTableResponseTableColumn[]
}

interface ISuggestTableResponse {
  tables: ISuggestTableResponseTable[]
}

const sampleData = {
  "tables": [
      {
          "name": "users",
          "columns": [
              {
                  "name": "id",
                  "type": "uuid",
                  "primary_key": true,
                  "default": "uuid_generate_v4()"
              },
              {
                  "name": "email",
                  "type": "text",
                  "default": null
              },
              {
                  "name": "created_at",
                  "type": "timestamp",
                  "default": "now()"
              }
          ]
      },
      {
          "name": "products",
          "columns": [
              {
                  "name": "id",
                  "type": "uuid",
                  "primary_key": true,
                  "default": "uuid_generate_v4()"
              },
              {
                  "name": "name",
                  "type": "text",
                  "default": null
              },
              {
                  "name": "description",
                  "type": "text",
                  "default": null
              },
              {
                  "name": "price",
                  "type": "numeric",
                  "default": null
              }
          ]
      },
      {
          "name": "orders",
          "columns": [
              {
                  "name": "id",
                  "type": "uuid",
                  "primary_key": true,
                  "default": "uuid_generate_v4()"
              },
              {
                  "name": "user_id",
                  "type": "uuid",
                  "foreign_key": true,
                  "references": "users",
                  "default": null
              },
              {
                  "name": "product_id",
                  "type": "uuid",
                  "foreign_key": true,
                  "references": "products",
                  "default": null
              },
              {
                  "name": "quantity",
                  "type": "int8",
                  "default": null
              }
          ]
      }
  ]
}

export function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<ISuggestTableResponse>()

  // Initial prompting
  const [initialIdeaQuery, setInitialIdeaQuery] = useState('')
  const ideaQueryInputEnabled = useMemo(() => {
    // Is loading and we have no initial data
    if (isLoading && (tables?.tables ?? []).length <= 0) {
      return false
    }

    // Not loading and we have no initial data
    if (!isLoading && (tables?.tables ?? []).length <= 0) {
      return true
    }

    // Is loading and we have initial data
    if (isLoading && (tables?.tables ?? []).length > 0) {
      return true
    }

    // Not loading and we have initial data
    if (!isLoading && (tables?.tables ?? []).length > 0) {
      return false
    }

    return true
  }, [isLoading, tables])
  const runInitialIdeaQuery = async () => {
    setIsLoading(true)

    try {
      const req = await fetch('/api/openai/gpt/suggestTable', {
        method: 'POST',
        body: JSON.stringify({
          prompt: initialIdeaQuery,
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const res = await req.json();// as ISuggestTableResponse
      // const data =  JSON.parse(res);
      setTables(res)
    } finally {
      setIsLoading(false)
    }
  }
  const runDebouncedInitialIdeaQuery = useDebouncedCallback(
    runInitialIdeaQuery, 1000, { trailing: true }
  );

  // Further prompting
  const [furtherPromptQuery, setFurtherPromptQuery] = useState('')
  const furtherPromptingQueryInputEnabled = useMemo(() => {
    // Is loading and we have no initial data
    if (isLoading && (tables?.tables ?? []).length <= 0) {
      return false
    }

    // Not loading and we have no initial data
    if (!isLoading && (tables?.tables ?? []).length <= 0) {
      return false
    }

    // Is loading and we have initial data
    if (isLoading && (tables?.tables ?? []).length > 0) {
      return false
    }

    // Not loading and we have initial data
    if (!isLoading && (tables?.tables ?? []).length > 0) {
      return true
    }
  }, [isLoading, tables])
  const runFurtherPromptQuery = async () => {
    setIsLoading(true)

    try {
      const req = await fetch('/api/openai/gpt/furtherPrompt', {
        method: 'POST',
        body: JSON.stringify({
          prompt: furtherPromptQuery,
          existingTablesJson: JSON.stringify(tables),
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const res = await req.json();
      setTables(res)
    } finally {
      setFurtherPromptQuery('')
      setIsLoading(false)
    }
  }
  const runDebouncedFurtherPromptQuery = useDebouncedCallback(
    runFurtherPromptQuery, 1000, { trailing: true }
  );

  // Generate SQL
  const [generatedSql, setGeneratedSql] = useState('')
  const runGenerateSql = async () => {
    setGeneratedSql('')
    setIsLoading(true)

    try {
      const req = await fetch('/api/openai/gpt/generateSql', {
        method: 'POST',
        body: JSON.stringify({
          existingTablesJson: JSON.stringify(tables),
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const res = await req.text();
      setGeneratedSql(res)
    } finally {
      setIsLoading(false)
    }
  }
  const runDebouncedGenerateSql = useDebouncedCallback(
    runGenerateSql, 1000, { trailing: true }
  );

  return (
    <XStack width={"100%"} height={"100%"} flex={1} backgroundColor={"$gray3"} p={"$3"}>
      <YStack f={1} jc="flex-start" ai="flex-start" p="$4" space={"$10"} height={"100%"} width={"100%"}>
        {/* Initial initialIdeaQuery / header */}
        <YStack>
          <H1 color={"$green10"}>Schematical</H1>
          <H6 color={"$gray10"}>A postgres schema generator, powered by OpenAI GPT-3.5-Turbo</H6>
        </YStack>

        <XStack space="$1" opacity={ideaQueryInputEnabled ? 1 : 0.5}width={"80%"} justifyContent={"flex-start"} alignSelf={"flex-start"} alignItems={"flex-start"}>
          <H3>I'm building</H3>
          <Input
            borderWidth={0}
            borderBottomWidth={ideaQueryInputEnabled ? 3 : 0}
            borderBottomColor={"$blue10Dark"}
            borderStyle={ideaQueryInputEnabled ? 'dashed' : 'solid'}
            borderRadius={0}
            width={"80%"}
            height={34}
            multiline={false}
            fontSize={23}
            paddingLeft={"$1"}
            fontWeight={'bold'}
            backgroundColor={"transparent"}
            color={"$orange10"}
            marginTop={0}
            marginLeft={5}
            outlineColor='transparent'
            disabled={!ideaQueryInputEnabled}
            numberOfLines={1}
            onChangeText={(text) => {
              if (!ideaQueryInputEnabled) {
                return
              }
              setInitialIdeaQuery(text)
            }}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Enter') {
                e.preventDefault()
                runDebouncedInitialIdeaQuery()
              }
            }}
            placeholder={'e.g. an online store, a blog website'}
            focusable={!ideaQueryInputEnabled}
            onSubmitEditing={runDebouncedInitialIdeaQuery}
            value={initialIdeaQuery}
            focusStyle={{ outlineColor: 'transparent', borderBottomColor: '$blue10Dark' }}
            hoverStyle={{ outlineColor: 'transparent', borderBottomColor: '$blue10Light' }}
          />
        </XStack>

        {/* Further prompting input */}
        {furtherPromptingQueryInputEnabled && (
          <XStack space="$1" width={"80%"} justifyContent={"flex-start"} alignSelf={"flex-start"} alignItems={"flex-start"}>
            <H3>Now I'd like to</H3>
            <Input
              borderWidth={0}
              borderBottomWidth={3}
              borderBottomColor={"$blue10Dark"}
              borderStyle='dashed'
              width={"80%"}
              height={34}
              multiline={false}
              fontSize={23}
              paddingLeft={"$1"}
              fontWeight={'bold'}
              color={"$orange10"}
              backgroundColor={"transparent"}
              marginTop={0}
              marginLeft={5}
              outlineColor='transparent'
              disabled={!furtherPromptingQueryInputEnabled}
              numberOfLines={1}
              onChangeText={(text) => {
                if (!furtherPromptingQueryInputEnabled) {
                  return
                }
                setFurtherPromptQuery(text)
              }}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Enter') {
                  e.preventDefault()
                  runDebouncedFurtherPromptQuery()
                }
              }}
              placeholder={`e.g. add a photos table, add a column to the ${tables?.tables?.[0]?.name ?? 'users'} table, etc - be descriptive`}
              focusable={furtherPromptingQueryInputEnabled}
              onSubmitEditing={runDebouncedFurtherPromptQuery}
              value={furtherPromptQuery}
              focusStyle={{ outlineColor: 'transparent', borderBottomColor: '$blue10Dark' }}
              hoverStyle={{ outlineColor: 'transparent', borderBottomColor: '$blue10Light' }}
            />
          </XStack>
        )}

        {/* Side panel + main panel */}
        <XStack width={"100%"} flexGrow={1} flex={1}>
          {/* Side panel */}
          <YStack flex={0.2} space={"$5"} alignItems='flex-start' justifyContent='flex-start' flexWrap='wrap' gap={"$5"}>
            {/* No content here yet */}
          </YStack>

          {/* Tables and main UI */}
          <XStack flexGrow={1} flex={1} space={"$5"} alignItems='flex-start' justifyContent='flex-start' flexWrap='wrap' gap={"$5"}>

            { isLoading && <Spinner size="large" color="$orange10" />}

            { !isLoading &&  (
              (tables?.tables ?? [])?.map((table) => {
                return (
                  <YStack borderRadius={"$8"} borderColor={"$gray10Light"} borderWidth={"$1"} p={"$2"} key={table.name}>
                    <H3 pb={"$2"}>{table.name}</H3>
                    <YStack borderRadius={"$6"} overflow='hidden' space={"$1"}>
                      {table.columns.map((column) => {
                        return (
                          <YStack>
                            {/* @ts-ignore */}
                            <DBTableRow primaryKey={column.primary_key} key={[table.name, column.name].join("__")} referencesTable={column.references ? [column.references, 'id'].join('.') : null}>
                              <DBTableRowLabel>{column.name}</DBTableRowLabel>
                              <DBTableRowLabel subtitle>{column.type}</DBTableRowLabel>
                            </DBTableRow>
                          </YStack>
                        )
                      })}
                  </YStack>
                  <AddColumnPrompt
                    onSave={(data) => {
                      const thisTable = tables.tables.find((t) => t.name === table.name)
                      const newColumn: ISuggestTableResponseTableColumn = {
                        name: data.name,
                        type: data.type,
                        default: null
                      }
                      // check if the table already contains a column with the same name
                      // If it does, return early

                      if (thisTable?.columns.find((c) => c.name === newColumn.name)) {
                        alert("Table already contains a column with this name")
                        return false
                      }
                      if (thisTable) {
                        const newTables = tables.tables.map((t) => {
                          if (t.name === table.name) {
                            return {
                              ...t,
                              columns: [
                                ...t.columns,
                                newColumn
                              ]
                            }
                          }
                          return t
                        })
                        setTables({
                          tables: newTables
                        })
                      }
                      return true
                    }}
                    targetTable={table.name}
                  />
                </YStack>
                )
              })
            )}
          </XStack>
        </XStack>

      </YStack>
      <XStack alignSelf={'flex-end'}>
        {(tables?.tables ?? []).length > 0 && (
          <SQLResultPanel 
            sqlText={generatedSql}
            openButton={<Button onPress={runDebouncedGenerateSql} backgroundColor={"$gray5"} color={"$green10"} fontWeight={'bold'} borderColor={"$green8"}>Generate schema SQL</Button>}
            isLoading={isLoading}
          />
        )}
      </XStack>
    </XStack>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)
  const toast = useToast()
  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
              toast.show('Sheet closed!', {
                message: 'Just showing how toast works...',
              })
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
