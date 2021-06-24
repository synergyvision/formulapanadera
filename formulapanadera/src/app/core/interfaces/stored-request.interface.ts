export interface StoredRequest {
  collection: string,
  type: 'C' | 'U' | 'D',
  data: any,
  originalData: any,
  time: number,
  id: string
}