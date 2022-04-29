import { useEffect, useState } from 'react';
import './App.css';
import {ourZmanim} from './lib/util.js'
import { SVG } from '@svgdotjs/svg.js'

const DIM = 800
const ZIP = '19143'
const SECOND_MS = 1000
const DOT_SIZE = 3
const LANDSCAPE_Y = 25
const PORTRAIT_X = 25
const LABEL_PADDING = 10
const FONT = 'Helvetica'
const FONT_SIZE = 10
const TWEAK_RATIO = 0.3
const TWEAK = FONT_SIZE * TWEAK_RATIO
const COORDINATES = {
  landscape: {
    timeline: {
      x1: 0,
      y1: LANDSCAPE_Y,
      x2: DIM,
      y2: LANDSCAPE_Y
    }
  },
  portrait: {
    timeline: {
      x1: PORTRAIT_X,
      y1: 0,
      x2: PORTRAIT_X,
      y2: DIM
    }
  },
}


function App() {
  const [nowTime, setNowTime] = useState(new Date())
  const [nowLabelTime, setNowLabelTime] = useState(new Date())
  const [headerTime, setHeaderTime] = useState(new Date())
  const [headerText, setHeaderText] = useState('')
  const [draw, setDraw] = useState()
  const [nowGroup, setNowGroup] = useState()
  const [dotsGroup, setDotsGroup] = useState()
  const [orientation, setOrientation] = useState('portrait')
  const [checked, setChecked] = useState(false)

  // initial draw, setInterval (1s) for nowTime
  useEffect(()=>{
    const svgDraw = SVG().addTo('div.timeline').size(800, 800).viewbox(0, 0, DIM, DIM)
    drawTimeline(svgDraw)
    setDraw(svgDraw)

    const interval = setInterval(() => {
      setNowTime(new Date())
    }, SECOND_MS);
  
    return () => clearInterval(interval);

    // eslint-disable-next-line
  }, [checked])


  // when headerTime changes...
  useEffect(()=>{
    setHeaderText(headerTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))  
    draw && fetchTimes()
    // eslint-disable-next-line
  }, [headerTime, draw])
  

  // Every second (when nowTime changes)...
  useEffect(() => {
    checkNowDot()
    checkHeader()
    // eslint-disable-next-line
  }, [nowTime, draw])


  const handleCheckToggle = () => {
    checked && setOrientation('portrait')
    !checked && setOrientation('landscape')
    setChecked(!checked)
    draw.remove()
  }


  // Check if the 'now dot' needs updating. (On minute change)
  const checkNowDot = () => {
    const nowMinute = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), nowTime.getHours(), nowTime.getMinutes())
    if (nowMinute.getTime() > nowLabelTime.getTime()) {
      setNowLabelTime(nowMinute)
      placeNowDot()
    }
  }
  

  // Check if header needs updating. (On date change)
  const checkHeader = () => {
    const nowDate = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate())
    if (nowDate.getTime() > headerTime.getTime()) {
      setHeaderTime(nowDate)
    }
  }
  

  const fetchTimes = () => {
    const dateISO = headerTime.toISOString().slice(0, 10)
    const api = `https://www.hebcal.com/zmanim?cfg=json&zip=${ZIP}&date=${dateISO}`

    fetch(api)
    .then(resp => resp.json())
    .then(json => {
      // setTimes(json.times))
      const times = ourZmanim.reduce((cur, key) => {
        cur[key] = json.times[key]
        return cur
      }, {})
      placeZmanim(times)
      placeNowDot()
    })
  }


  const placeDot = (parent, name, time) => {
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const dist = hours * 30 + minutes / 2 - 50

    const options = { hour: 'numeric', minute: 'numeric' }
    let x, y, labelX, labelY, transformation

    if (orientation === 'landscape') {
      x = dist
      y = LANDSCAPE_Y
      labelX = dist
      labelY = LANDSCAPE_Y + LABEL_PADDING
      transformation = {rotate: 90, origin: [labelX - TWEAK, labelY]}
    } else {
      x = PORTRAIT_X
      y = dist
      labelX = PORTRAIT_X + LABEL_PADDING
      labelY = dist + TWEAK
      transformation = {}
    }

    const dot = parent.group()
    dot.circle().radius(DOT_SIZE).center(x, y).id(name)
    dot.text(name + ' (' + time.toLocaleString("en-US", options) + ')').amove(labelX, labelY).transform(transformation).font({family: FONT, size: FONT_SIZE}).id(`${name}-label`)
  }


  const placeZmanim = (times) => {    
    const dots = draw.group()
    dotsGroup && dotsGroup.remove()
    setDotsGroup(dots)
    
    const timeKeys = Object.keys(times)
    timeKeys.forEach(name => {
      const zman = new Date(times[name])
      placeDot(dots, name, zman)
    })
  }


  const placeNowDot = () => {
    const group = draw.group()
    nowGroup && nowGroup.remove()
    setNowGroup(group)
    placeDot(group, 'now', nowTime)
  }


  const drawTimeline = (draw) => {
    const { x1, x2, y1, y2 } = COORDINATES[orientation].timeline    
    draw.line( x1, y1, x2, y2).stroke({width: 1, color: '#000'})
  }


  return (
    <div className="App" >
      <div className="header">
        <h2>{headerText}</h2>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckToggle}
          />
          Landscape
        </label>
      </div>
      <div className="timeline" />
    </div>
  );
}


export default App;
