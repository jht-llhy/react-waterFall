# react-waterFall

react轻量级瀑布流组件

## 参数

|参数|说明|类型|默认值|
|:--:|:--:|:--:|:--:|
|col|列数，必填|number or string|3|
|horizontalSpacing|水平间距|number or string|10|
|verticalSpacing|垂直间距|number or string|10|
|waterFallBoxStyle|瀑布流容器样式覆盖|Object|{}|
|width|宽度，建议填写，不写则自适应|number or string|'unset'|
|useWindow|触底加载以body作为参照|boolean|false|
|limitHeight|触底加载触发高度|number or string|50|
|CardComponent|卡片组件|React.ComponentType<any>|() => null|
|data|循环数据|Array<any>|[]|
|onReachBottom|数据加载钩子函数|Function|() => { }|

## 示例

```javascript
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
    waterFallBoxStyle: {},
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
```