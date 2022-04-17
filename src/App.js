import { useEffect, useState } from 'react';
import './App.css';
import {ourZmanim} from './lib/util.js'
import { SVG } from '@svgdotjs/svg.js'

const dim = 600


function App() {
  // const [times, setTimes] = useState({});
  const dateISO = '2022-01-08'
  // const date = new Date(dateISO)
  const zip = '19143'
  const api = `https://www.hebcal.com/zmanim?cfg=json&zip=${zip}&date=${dateISO}`


  useEffect(()=>{
    const draw = SVG().addTo('div.App').size(dim * 1.5, dim).viewbox(0, 0, dim, dim)
    drawClock(draw)
    fetchTimes(draw)
    // setInterval(runClock, 1000);


  }, [dateISO])


  const runClock = () => {
    const HOURHAND = document.querySelector("#hour");
    const MINUTEHAND = document.querySelector("#minute");
    const SECONDHAND = document.querySelector("#second");
    const date = new Date();
    let hr = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    console.log("Hour: " + hr + " Minute: " + min + " Second: " + sec);
  
    let hrPosition = (hr * 360) / 12 + (min * (360 / 60)) / 12;
    let minPosition = (min * 360) / 60 + (sec * (360 / 60)) / 60;
    let secPosition = (sec * 360) / 60;
  
    // Set each position when the function is called
    hrPosition = hrPosition + 3 / 360;
    minPosition = minPosition + 6 / 60;
    secPosition = secPosition + 6;
  
    // Set the transformation for each arm
    HOURHAND.style.transform = "rotate(" + hrPosition + "deg)";
    MINUTEHAND.style.transform = "rotate(" + minPosition + "deg)";
    SECONDHAND.style.transform = "rotate(" + secPosition + "deg)";
  };
  

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


  const drawClock = (draw) => {
    const hourMarksPath = 'M300.5 94V61M506 300.5h32M300.5 506v33M94 300.5H60M411.3 107.8l7.9-13.8M493 190.2l13-7.4M492.1 411.4l16.5 9.5M411 492.3l8.9 15.3M189 492.3l-9.2 15.9M107.7 411L93 419.5M107.5 189.3l-17.1-9.9M188.1 108.2l-9-15.6'

    const face = draw.group().id('face')
    face.circle().radius(253.9).center(300, 300).addClass('circle')
    face.path(hourMarksPath).addClass('hour-marks')
    // face.circle().radius(16.2).center(300, 300).addClass('mid-circle')

    // const hour = draw.group().id('hour')
    // hour.path('M300.5 298V142').addClass('hour-arm')
    // hour.circle().radius(253.9).center(300, 300).addClass('sizing-box')

    // const minute = draw.group().id('minute')
    // minute.path('M300.5 298V67').addClass('minute-arm')
    // minute.circle().radius(253.9).center(300, 300).addClass('sizing-box')

    // const second = draw.group().id('second')
    // second.path('M300.5 350V55').addClass('second-arm')
    // second.circle().radius(253.9).center(300, 300).addClass('sizing-box')
  }


  const placeDots = (draw, times) => {
    const timeKeys = Object.keys(times)
    timeKeys.forEach(name => {
      console.log(name, times[name])
      const zman = new Date(times[name])
      const hours = zman.getHours()
      const minutes = zman.getMinutes()
      const rotation = hours * 15 + minutes / 4
      
      const dot = draw.group()
      dot.circle().radius(10).center(300, 46.1).fill('none')
      dot.circle().radius(10).center(300, 553.9).addClass('dot').id(name)
  
      dot.transform({rotate: rotation})
    })
  }



  return (
    <div className="App" />
  );
}

export default App;
