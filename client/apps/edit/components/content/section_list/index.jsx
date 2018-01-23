import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { changeSection } from 'client/actions/editActions'
import SectionContainer from '../section_container'
import { SectionTool } from '../section_tool'
import DragContainer from 'client/components/drag_drop/index.coffee'

export class SectionList extends Component {
  static propTypes = {
    activeSection: PropTypes.any,
    changeSectionAction: PropTypes.func,
    sections: PropTypes.object.isRequired
  }

  componentDidMount = () => {
    const { sections } = this.props

    sections.on('add', this.onNewSection)
    // TODO: Remove forceRerender
    sections.on('change:layout', this.forceReRender)
    sections.on('reset', this.forceReRender)
    sections.on('destroy', this.forceReRender)
  }

  onNewSection = (section) => {
    const { changeSectionAction, sections } = this.props
    const newActiveSection = sections.indexOf(section)

    changeSectionAction(newActiveSection)
  }

  onDragEnd = (newSections) => {
    const { sections } = this.props
    sections.reset(newSections)
  }

  forceReRender = () => {
    // TODO: Move sections to redux so
    // changes will trigger re-render
    // Below forces update on Backbone change
    this.setState({lastUpdated: new Date()})
  }

  renderSectionList = () => {
    const {
      activeSection,
      changeSectionAction,
      sections
    } = this.props

    return sections.map((section, index) => {
      if (section.get('type') !== 'callout') {
        return (
          <div key={section.cid}>
            <SectionContainer
              sections={sections}
              section={section}
              index={index}
              isDraggable
              editing={activeSection === index}
              onSetEditing={(i) => changeSectionAction(i)}
            />
            <SectionTool
              sections={sections}
              index={index}
              editing={activeSection !== 0}
            />
          </div>
        )
      }
    })
  }

  render () {
    const {
      activeSection,
      sections
    } = this.props

    return (
      <div className='SectionList edit-sections__list'>
        <SectionTool
          sections={sections}
          index={-1}
          isEditing={activeSection !== null}
          firstSection
          isDraggable={false}
        />
        {sections.length && sections.length > 1
          ? <DragContainer
              items={sections.models}
              onDragEnd={this.onDragEnd}
              isDraggable={activeSection === null}
              layout='vertical'
            >
              {this.renderSectionList()}
            </DragContainer>
          : <div>
              {this.renderSectionList()}
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeSection: state.edit.activeSection
})

const mapDispatchToProps = {
  changeSectionAction: changeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)