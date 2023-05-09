export class TablePaginationHelper {
  searchLen = 0
  startIndex = 0

  constructor(fullLen, pageSize, pageIndex) {
    this.fullLen = fullLen
    this.pageNumArray = Array()
    this.pageSize = pageSize
    this.pagesIndex = pageIndex
    this.buildChoices()
    this.buildSlices()
  }

  buildChoices() {
    if (this.fullLen <= 30)
      this.pageNumArray = [30]
    else if (this.fullLen > 30 && this.fullLen <= 50)
      this.pageNumArray = [30, 50]
    else if (this.fullLen > 50 && this.fullLen <= 100)
      this.pageNumArray = [30, 50, 100]
    else if (this.fullLen > 100)
      this.pageNumArray = [30, 50, 100, this.fullLen]

    return this.pageNumArray
  }

  constructSlicesArrays(num, len) {
    let slices = Array()
    let times = Math.trunc(len / num)
    let start = 0
    let end = 0
    for (var i = 0; i < times; i++) {
      start = i * num
      end = start + num
      slices.push([start, end])
    }
    if (end)
      slices.push([end, len])
    return slices
  }

  buildSlices() {
    let pagesAndIndexes = Object()
    let len = this.fullLen

    if (this.searched)
      len = this.searchLen

    if (len <= 30)
      pagesAndIndexes['30'] = [[0, len]]
    else if (len > 30 && len <= 50) {
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
    }
    else if (len > 50 && len <= 100) {
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
      pagesAndIndexes['100'] = this.constructSlicesArrays(100, len)
    }
    else if (len > 100)
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
      pagesAndIndexes['100'] = this.constructSlicesArrays(100, len)

    pagesAndIndexes[len] = [[0, len]]

    this.pagesIndexes = pagesAndIndexes
  }

  calcEndIndex() {
    return this.pageSize + this.startIndex
  }

  set pagesIndexes(slices) {
    this.pagesAndIndexes = slices
  }

  set searchNum(i) {
    this.searchLen = i
  }

  set isSearched(b) {
    this.searched = b
    if (this.searched)
      this.buildSlices()
  }

  get choices() {
    return this.buildChoices()
  }

  get end() {
    let arraySlices = this.pagesAndIndexes[this.pageSize]
    let targetSlice = arraySlices[this.pagesIndex]
    if (targetSlice)
      return targetSlice[1]
    else
      return this.fullLen
  }

  get pageCount() {
    let pages = 1
    let endIndex = this.calcEndIndex()

    if (endIndex >= this.fullLen)
      endIndex = this.fullLen

    if (endIndex - this.startIndex === this.fullLen)
      return pages
    else if (this.searched && this.searchLen <= this.pageSize)
      return pages
    else if (this.searched && this.searchLen > this.pageSize)
      return Math.trunc(this.searchLen / this.pageSize) + 1
    else
      return Math.trunc(this.fullLen / this.pageSize) + 1
  }

  get start() {
    let arraySlices = this.pagesAndIndexes[this.pageSize]
    let targetSlice = arraySlices[this.pagesIndex]
    if (targetSlice)
      return targetSlice[0]
    else
      return 0
  }
}
