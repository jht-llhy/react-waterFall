import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'

import WaterFall from '../waterFall/WaterFall'

import './index.less'

const getDefaultData = () => {
  return Array.from(Array(10), (v, k) => {
    return 200 + Math.random() * 200
  })
}


function CardComponent(props: any) {
  return (
    <div className='card-box' style={{ height: props.data }}>
      <div className='card-content'>{props.data}</div>
    </div>
  )
}

function App() {
  const [data, setData] = useState<Array<any>>(getDefaultData())

  const onReachBottom = useCallback(() => {
    setTimeout(() => {
      setData((pre) => {
        return [ ...pre,  ...getDefaultData() ]
      })
    }, 300)
  }, [data])

  const waterFallProps = {
    col: 3,
    horizontalSpacing: 10,
    verticalSpacing: 10,
    width: 'unset',
    useWindow: false,
    limitHeight: 50,
    CardComponent,
    data,
    onReachBottom,
  }

  return (
    <>
      <WaterFall {...waterFallProps} />
      <button onClick={onReachBottom}>12312312312313</button>
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
