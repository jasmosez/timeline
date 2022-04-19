import { useEffect, useState } from 'react';
import './App.css';
import {ourZmanim} from './lib/util.js'
import { SVG } from '@svgdotjs/svg.js'

const DIM = 600
const ZIP = '19143'
const SECOND_MS = 1000;


function App() {
  const [nowTime, setNowTime] = useState(new Date())
  const [nowLabelTime, setNowLabelTime] = useState(new Date())
  const [headerTime, setHeaderTime] = useState(new Date())
  const [headerText, setHeaderText] = useState('')
  const [draw, setDraw] = useState()
  const [nowGroup, setNowGroup] = useState()
  const [dotsGroup, setDotsGroup] = useState()
  

  // initial draw, setInterval (1s) for nowTime
  useEffect(async ()=>{
    const svgDraw = SVG().addTo('div.timeline').size(DIM * 1.5, DIM).viewbox(0, 0, DIM, DIM)
    drawTimeline(svgDraw)
    setDraw(svgDraw)

    const interval = setInterval(() => {
      setNowTime(new Date())
    }, SECOND_MS);
  
    return () => clearInterval(interval);

  }, [])


  // when headerTime changes...
  useEffect(()=>{
    setHeaderText(headerTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))  
    draw && fetchTimes()
  }, [headerTime, draw])
  

  // Every second (when nowTime changes)...
  useEffect(() => {
    checkNowDot()
    checkHeader()
  }, [nowTime, draw])


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
  

  const fetchTimes = async () => {
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


  const placeZmanim = (times) => {
    const timeKeys = Object.keys(times)
    let options = { hour: 'numeric', minute: 'numeric' }

    const dots = draw.group()
    dotsGroup && dotsGroup.remove()
    setDotsGroup(dots)

    timeKeys.forEach(name => {
      console.log(name, times[name])
      const zman = new Date(times[name])
      const hours = zman.getHours()
      const minutes = zman.getMinutes()
      const dist = hours * 30 + minutes / 2 - 50
      
      const dot = dots.group()
      dot.circle().radius(3).center(dist, 25).id(name)
      dot.text(name + ' (' + zman.toLocaleString("en-US", options) + ')').move(dist, 50).transform({rotate: 90, origin: [dist + 12, 50]}).font({family: 'Helvetica', size: 10})

    })
  }


  const placeNowDot = () => {
    let options = { hour: 'numeric', minute: 'numeric' }
    const hours = nowTime.getHours()
    const minutes = nowTime.getMinutes()
    const dist = hours * 30 + minutes / 2 - 50

    const group = draw.group()
    nowGroup && nowGroup.remove()
    setNowGroup(group)
    group.circle().radius(3).center(dist, 25).addClass('dot').id('now')
    group.text(`now (${nowTime.toLocaleString("en-US", options)})`).move(dist, 50).transform({rotate: 90, origin: [dist + 12, 50]}).font({family: 'Helvetica', size: 10}).fill('#F77')
  }


  const drawTimeline = (draw) => {
    draw.line( -50, 25, 670, 25).stroke({width: 1, color: '#000'})
  }


  return (
    <div className="App" >
      <div className="header">
        {headerText}
      </div>
      <div className="timeline" />
    </div>
  );
}


export default App;
