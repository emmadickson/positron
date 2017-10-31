import React from 'react'
import ReactDOM from 'react-dom'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import track from 'react-tracking'
const sd = require('sharify').data

@track({ page: 'Instant Article Display Panel' })
class DisplayWrapper extends React.Component {
  render () {
    return (
      <DisplayPanel
        unit={sd.CAMPAIGN.panel}
        campaign={sd.CAMPAIGN}
      />
    )
  }
}

export const init = () => {
  ReactDOM.render(
    React.createElement(DisplayWrapper),
    document.getElementById('react-root')
  )
}
