import React, { PureComponent } from 'react'
import { Animate } from 'react-move'
import { Connect } from 'codux'

import {
  area,
  line,
  curveCardinal,
  curveMonotoneX
} from 'd3-shape'
//
import Utils from '../utils/Utils'
import { selectSeries, selectDatum, hoverSeries, hoverDatum } from '../utils/interactionMethods'

import Path from '../primitives/Path'
import Circle from '../primitives/Circle'

const pathDefaultStyle = {
  strokeWidth: 2
}

const circleDefaultStyle = {
  r: 2
}

class Area extends PureComponent {
  render () {
    const {
      series,
      visibility,
      //
      selected,
      hovered,
      interaction
    } = this.props

    const status = Utils.seriesStatus(series, hovered, selected)
    const style = Utils.getStatusStyle(status, series.statusStyles)

    const areaFn = area()
    .curve(curveMonotoneX)
    .y0(d => d[2])

    const lineFn = line()
    .curve(curveMonotoneX)

    return (
      <Animate
        default={{
          data: series.data,
          visibility: 0
        }}
        data={{
          data: series.data,
          visibility
        }}
        
      >
        {inter => {
          const areaPath = areaFn(inter.data.map(d => ([d.x, d.y, d.base])))
          const linePath = lineFn(inter.data.map(d => ([d.x, d.y])))

          const seriesInteractionProps = interaction === 'series' ? {
            onClick: selectSeries.bind(this, series),
            onMouseEnter: hoverSeries.bind(this, series),
            onMouseMove: hoverSeries.bind(this, series),
            onMouseLeave: hoverSeries.bind(this, null)
          } : {}

          return (
            <g>
              <Path
                d={areaPath}
                style={{
                  ...pathDefaultStyle,
                  ...style,
                  ...style.area,
                  stroke: 'transparent'
                }}
                opacity={inter.visibility}
                {...seriesInteractionProps}
              />
              <Path
                d={linePath}
                style={{
                  ...pathDefaultStyle,
                  ...style,
                  ...style.line,
                  fill: 'none'
                }}
                opacity={inter.visibility}
                {...seriesInteractionProps}
              />
              {inter.data.map((datum, i) => {
                const status = Utils.datumStatus(series, datum, hovered, selected)
                const dataStyle = Utils.getStatusStyle(status, datum.statusStyles)

                const datumInteractionProps = interaction === 'element' ? {
                  onClick: selectDatum.bind(this, datum),
                  onMouseEnter: hoverDatum.bind(this, datum),
                  onMouseMove: hoverDatum.bind(this, datum),
                  onMouseLeave: hoverDatum.bind(this, null)
                } : {}

                return (
                  <Circle
                    key={i}
                    x={datum.x}
                    y={datum.y}
                    style={{
                      ...circleDefaultStyle,
                      ...style,
                      ...style.circle,
                      ...dataStyle,
                      ...dataStyle.circle
                    }}
                    opacity={inter.visibility}
                    // {...seriesInteractionProps}
                    {...datumInteractionProps}
                  />
                )
              })}
            </g>
          )
        }}
      </Animate>
    )
  }
}

export default Connect((state, props) => {
  return {
    hovered: state.hovered,
    selected: state.selected,
    interaction: state.interaction
  }
}, {
  filter: (oldState, newState, meta) => meta.type !== 'cursor'
})(Area)