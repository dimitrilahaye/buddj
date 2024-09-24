/**
 * @typedef {{
 *  value: string,
 *  label: string,
 *  selected?: boolean,
 * }} Option
 */

/**
 * @typedef {{
 *  color: string,
 *  size?: string,
 *  week: string,
 *  remaining: number,
 * }} WeekBlockProps
 */

/**
 * @typedef {{
 *  file: string,
 *  week: 'Semaine1'|'Semaine2'|'Semaine3'|'Semaine4'|'SemaineBonus',
 *  lib: string,
 *  amount: number,
 * }} ReceiptFormResult
 */

/**
 * @typedef {{
 *  lib: string,
 *  amount: number,
 * }} OutflowFormResult
 */

/**
 * @typedef {{
 * expenses: PendingResult[],
 * id: string,
 * name: string
 * }} WeeklyBudget
 */

/**
 * @typedef {{
 * id: string,
 * weekId: string,
 * weekName: string,
 * label: string,
 * amount: number,
 * isChecked: boolean
 * }} PendingResult
 */

/**
 * @typedef {{
 * id: string,
 * label: string,
 * amount: number,
 * isChecked: boolean
 * }} OutflowsResult
 */

/**
 * @typedef {{
 * currentBalance: string,
 * outflows: OutflowsResult[],
 * }} OutflowsData
 */


/**
 * @typedef {{
 * id: string,
 * name: string,
 * }} Month
 */
