import {
  ContentState,
  EditorState,
  Modifier
} from 'draft-js'

export const standardizeSpacing = (html) => {
  const newHtml = html
    .replace(/<br>/g, '')
    .replace(/<span><\/span>/g, '')
    .replace(/<h2><\/h2>/g, '<p><br></p>')
    .replace(/<h3><\/h3>/g, '<p><br></p>')
    .replace(/<p><\/p><p><\/p>/g, '<p><br></p>')
    .replace(/<p><\/p>/g, '<p><br></p>')
    .replace(/<p> <\/p>/g, '<p><br></p>')
    .replace(/<p><br><\/p><p><br><\/p>/g, '<p><br></p>')
    .replace(/  /g, ' &nbsp;')

  return newHtml
}

export const replaceUnicodeSpaces = (html) => {
  // Replace unicode linebreaks with html breaks
  const doc = document.createElement('div')
  doc.innerHTML = html
  const ps = doc.getElementsByTagName('p')

  for (let i = 0; i < ps.length; i++) {
    const innerP = doc.getElementsByTagName('p')[i].innerHTML
      .replace(/[\u{2028}-\u{2029}]/gu, '</p><p>')
    const newP = `<p>${innerP}</p>`
    $(doc.getElementsByTagName('p')[i]).replaceWith(newP)
  }
  return doc.innerHTML
}

export const stripCharacterStyles = (contentBlock, keepAllowed) => {
  // TODO - use selection, not content block
  const characterList = contentBlock.getCharacterList().map((character) => {
    if (keepAllowed && !character.hasStyle('UNDERLINE')) {
      // if keepAllowed (used on paste)
      // strip only styles not allowed in editor
      if (
        character.hasStyle('BOLD') ||
        character.hasStyle('ITALIC') ||
        character.hasStyle('STRIKETHROUGH')
      ) {
        return character
      }
    }
    return character.set('style', character.get('style').clear())
  })
  return contentBlock.set('characterList', characterList)
}

export const stripH3Tags = (html) => {
  // replace style tags inside h3 for classic layouts
  const doc = document.createElement('div')
  doc.innerHTML = html
  const h3s = doc.getElementsByTagName('h3')
  for (let i = 0; i < h3s.length; i++) {
    const innerH3 = doc.getElementsByTagName('h3')[i].innerHTML
      .replace(/<em>/g, '')
      .replace(/<\/em>/g, '')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
    const newH3 = `<h3>${innerH3}</h3>`
    $(doc.getElementsByTagName('h3')[i]).replaceWith(newH3)
  }
  return doc.innerHTML
}

export const removeDisallowedBlocks = (editorState, blocks, allowedBlocks) => {
  const currentContent = editorState.getCurrentContent()
  const selection = editorState.getSelection()

  const cleanedBlocks = blocks.map((contentBlock) => {
    const unstyled = stripCharacterStyles(contentBlock, true)
    const isAllowedBlock = allowedBlocks.includes(unstyled.getType())
    const isLink = unstyled.getType() === 'LINK'

    if (isAllowedBlock || isLink) {
      return unstyled
    } else {
      return unstyled.set('type', 'unstyled')
    }
  })
  const blockMap = ContentState.createFromBlockArray(cleanedBlocks, blocks).blockMap
  const newContent = Modifier.replaceWithFragment(currentContent, selection, blockMap)
  const newState = EditorState.push(editorState, newContent, 'insert-fragment')

  return newState
}

const replaceGoogleFalseTags = (html) => {
  let doc = document.createElement('div')
  doc.innerHTML = html

  var spanBlocks = Array.from(doc.getElementsByTagName('SPAN'))

  spanBlocks.map((block, i) => {
    const { style } = block
    const isItalic = style && style.fontStyle === 'italic'
    const isBold = style && style.fontWeight === '700'

    if (isItalic && isBold) {
      block = '<span><strong><em>' + block.innerHTML + '</em></strong></span>'
    } else if (isItalic) {
      block = '<span><em>' + block.innerHTML + '</em></span>'
    } else if (isBold) {
      block = '<span><strong>' + block.innerHTML + '</strong></span>'
    }
    $(doc.getElementsByTagName('SPAN')[i]).replaceWith(block)
  })
  return doc.innerHTML
}

const removeGoogleFalseBoldTags = (html) => {
  let doc = document.createElement('div')
  doc.innerHTML = html

  var boldBlocks = Array.from(doc.getElementsByTagName('B'))

  boldBlocks.map((block, i) => {
    const { style } = block

    if (style && style.fontWeight === 'normal') {
      $(doc.getElementsByTagName('B')[i]).replaceWith(block.innerHTML)
    }
  })
  return doc.innerHTML
}

export const stripGoogleStyles = (html) => {
  // Applied on paste
  // 1. Remove non-breaking spaces between paragraphs
  let strippedHtml = html
    .replace(/<\/p><br>/g, '</p>')
    .replace('<br class="Apple-interchange-newline">', '')

  // 2. Remove dummy <b> tags google docs wraps document in
  strippedHtml = removeGoogleFalseBoldTags(strippedHtml)

  // 3. Replace bold/italic spans with actual strong/em tags
  strippedHtml = replaceGoogleFalseTags(strippedHtml)

  // 4. Replace illegally pasted unicode spaces
  strippedHtml = replaceUnicodeSpaces(strippedHtml)

  // 5. Strip non-style guide spaces
  strippedHtml = standardizeSpacing(strippedHtml)

  return strippedHtml
}
