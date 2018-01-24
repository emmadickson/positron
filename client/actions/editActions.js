import keyMirror from 'client/lib/keyMirror'
import { emitAction } from 'client/apps/websocket/client'
import { messageTypes } from 'client/apps/websocket/messageTypes'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_SECTION',
  'CHANGE_VIEW',
  'VIEW_ARTICLES',
  'START_EDITING_ARTICLE',
  'STOP_EDITING_ARTICLE',
  'DELETE_ARTICLE',
  'ERROR',
  'PUBLISH_ARTICLE',
  'SAVE_ARTICLE'
)

export const changeSavedStatus = (isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    isSaved
  }
})

export const changeSection = (activeSection) => ({
  // Index of active article section
  type: actions.CHANGE_SECTION,
  payload: {
    activeSection
  }
})

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const viewArticles = emitAction(() => ({
  type: actions.VIEW_ARTICLES,
  key: messageTypes.articlesRequested,
  payload: {
    timestamp: new Date().toISOString()
  }
}))

export const deleteArticle = (article) => {
  article.destroy({
    success: () => {
      article.trigger('finished')
    }
  })

  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true
    }
  }
}

export const startEditingArticle = emitAction((data) => {
  return {
    type: actions.START_EDITING_ARTICLE,
    key: messageTypes.userStartedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const stopEditingArticle = emitAction((data) => {
  return {
    type: actions.STOP_EDITING_ARTICLE,
    key: messageTypes.userStoppedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const publishArticle = (article, published) => {
  article.set('published', published)
  article.save()
  article.trigger('finished')

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const saveArticle = (article) => {
  article.save()

  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true
    }
  }
}

// EDITING ERRORS
export const logError = (error) => ({
  type: actions.ERROR,
  payload: {
    error
  }
})

export const resetError = () => ({
  type: actions.ERROR,
  payload: {
    error: null
  }
})
