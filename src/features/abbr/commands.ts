import { createCommand, LexicalCommand, LexicalNode } from '@payloadcms/richtext-lexical/lexical'
import { AbbrFields } from './node'

/**
 * The payload of a node
 * This can be delivered from the link node to the drawer, or from the drawer/anything to the TOGGLE_LINK_COMMAND
 */
export type AbbrPayload = {
  /**
   * The fields of the node. Undefined fields will be taken from the default values of the link node
   */
  fields: Partial<AbbrFields>
  selectedNodes?: LexicalNode[]
  /**
   * The text content of the node - will be displayed in the drawer
   */
  text: null | string
} | null

export const TOGGLE_ABBR_WITH_MODAL_COMMAND: LexicalCommand<AbbrPayload | null> = createCommand(
  'TOGGLE_ABBR_WITH_MODAL_COMMAND',
)
