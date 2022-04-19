import { useEffect, useState } from 'react';
import './App.css';
import {ourZmanim} from './lib/util.js'
import { SVG } from '@svgdotjs/svg.js'

const dim = 600

function App() {
  const headerTime = new Date()
  const headerText = headerTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const dateISO = headerTime.toISOString().slice(0, 10)
  
  const zip = '19143'
  const api = `https://www.hebcal.com/zmanim?cfg=json&zip=${zip}&date=${dateISO}`


  useEffect(()=>{
    const draw = SVG().addTo('div.timeline').size(dim * 1.5, dim).viewbox(0, 0, dim, dim)
    drawTimeline(draw)
    fetchTimes(draw)

  }, [dateISO])
  

  const fetchTimes = async (draw) => {
    fetch(api)
    .then(resp => resp.json())
    .then(json => {
      // setTimes(json.times))
      const times = ourZmanim.reduce((cur, key) => {
        cur[key] = json.times[key]
        return cur
      }, {})
      placeDots(draw, times)
    })
  }


  const placeDots = (draw, times) => {
    const timeKeys = Object.keys(times)
    let options = { hour: 'numeric', minute: 'numeric' }
    timeKeys.forEach(name => {
      console.log(name, times[name])
      const zman = new Date(times[name])
      const hours = zman.getHours()
      const minutes = zman.getMinutes()
      const dist = hours * 30 + minutes / 2 - 50
      
      const dot = draw.group()
      dot.circle().radius(3).center(dist, 25).id(name)
      dot.text(name + ' (' + zman.toLocaleString("en-US", options) + ')').move(dist, 50).transform({rotate: 90, origin: [dist + 12, 50]}).font({family: 'Helvetica', size: 10})

    })
    const zman = new Date()
    const hours = zman.getHours()
    const minutes = zman.getMinutes()
    const dist = hours * 30 + minutes / 2 - 50
    draw.circle().radius(3).center(dist, 25).addClass('dot').id('now')
    draw.text(`now (${zman.toLocaleString("en-US", options)})`).move(dist, 50).transform({rotate: 90, origin: [dist + 12, 50]}).font({family: 'Helvetica', size: 10, color: '#F77'})
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
