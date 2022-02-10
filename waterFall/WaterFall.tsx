import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react'

import throttle from 'lodash/throttle'
import intersectionWith from 'lodash/intersectionWith'
import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'

export interface WaterFallProps {
  col: number | string;                       // 列数，必填
  horizontalSpacing: number | string;         // 水平间距
  verticalSpacing: number | string;           // 垂直间距
  waterFallBoxStyle: Object;                  // 瀑布流容器样式覆盖
  width?: number | string;                    // 宽度，建议填写，不写则自适应
  useWindow?: boolean;                        // 触底加载以body作为参照
  limitHeight?: number | string;              // 触底加载触发高度
  CardComponent: React.ComponentType<any>;    // 卡片组件
  data: Array<any>;                           // 循环数据
  onReachBottom: Function;                    // 数据加载钩子函数
}

const defaultStyle: Object = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

WaterFall.defaultProps = {
  col: 3,
  horizontalSpacing: 10,
  verticalSpacing: 10,
  waterFallBoxStyle: {},
  width: 'unset',
  useWindow: false,
  limitHeight: 50,
  CardComponent: () => null,
  data: [],
  onReachBottom: () => { },
}

enum minOrMax {
  min,
  max
}

function getEmptyArr(col: number | string) {
  return Array.from(Array(col), (v, k) => [])
}

function getIntersection(preData: Array<any>, data: Array<any>) {
  return intersectionWith(preData, data, isEqual);
}

function getDifference(preData: Array<any>, data: Array<any>) {
  return differenceWith(data, preData, isEqual);
}

function nextIndex(current: number, sum: number) {
  if (current === sum - 1) {
    return 0
  } else {
    return current + 1
  }
}

function getDomByHeight(domList: Array<Element>, type: minOrMax) {
  const a = [...domList]
  const sortList = a.sort((a, b) => {
    return b.clientHeight - a.clientHeight
  })

  const sortFlag = type === minOrMax.min ? sortList.length - 1 : 0;
  const colDom = sortList[sortFlag];

  const index = domList.indexOf(colDom);
 
  return {
    colDom,
    index,
  }
}

function useScroll(useWindow: any, limitHeight: any, waterFallNode: any, onReachBottom: Function) {
  useLayoutEffect(()=>{
    const target = useWindow ? window : waterFallNode.current.parentNode;

    const onScroll = throttle(() => {
      let scrollHeight, scrollTop, innerHeight;
      if(useWindow) {
        scrollHeight = document.body.scrollHeight;
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        innerHeight = window.innerHeight;
      }else {
        scrollHeight = target.scrollHeight;
        scrollTop = target.scrollTop;
        innerHeight = target.clientHeight;
      }
      if(scrollTop + innerHeight >= scrollHeight - limitHeight) {
        onReachBottom();
      }
    }, 300)

    target.addEventListener('scroll', onScroll);

    return ()=>{
      target.removeEventListener('scroll', onScroll);
    }
  }, [])
}

export default function WaterFall(props: WaterFallProps) {
  const {
    col,
    horizontalSpacing,
    verticalSpacing,
    waterFallBoxStyle,
    width,
    useWindow,
    limitHeight,
    CardComponent,
    data,
    onReachBottom,
  } = props;

  const waterFallNode = useRef(null);

  const preData = useRef<Array<any>>([]);

  const preColIndex = useRef<number>(0);

  const [colArr, setColArr] = useState<Array<any>>(getEmptyArr(col)); // 列数据

  const setPreColIndex = (colDomList:Element[]) => {
    const { index } = getDomByHeight(colDomList, minOrMax.min);
    preColIndex.current = index;
  }

  const computedData = (data:Array<any>, refresh?:boolean) => {
    const targetArr: Array<any> = refresh ? getEmptyArr(col) : colArr;
    const currentData = [...data];

    let itemIndex = data.length;
    let colIndex = preColIndex.current;

    while (itemIndex !== 0) {
      const currentCol = colIndex;
      const currentItem = currentData.shift();
      targetArr[currentCol].push(currentItem);

      colIndex = nextIndex(colIndex, Number(col));
      itemIndex--;
    }

    setColArr([...targetArr])
  }

  const arrangeData = (maxIndex: number, minIndex: number) => {
    const maxHeightDataList = colArr[maxIndex];
    const minHeightDataList = colArr[minIndex];

    const maxHeightDataLastItem = maxHeightDataList.pop();
    minHeightDataList.push(maxHeightDataLastItem);

    setColArr([...colArr]);
  }

  const computedDom = () => {
    // 列集合
    const colDomList = Array.from(document.getElementsByClassName('waterFall-col-box'));

    // 最高列 最矮列
    const { colDom: maxHeightColList, index: maxHeightIndex } = getDomByHeight(colDomList, minOrMax.max);
    const { colDom: minHeightColList, index: minHeightIndex } = getDomByHeight(colDomList, minOrMax.min);

    // 最高列最后一个子元素
    const maxHeightColChildrenList: Array<any> = Array.from(maxHeightColList.childNodes);
    const maxHeightColLastChild = maxHeightColChildrenList[maxHeightColChildrenList.length - 1];

    if (!maxHeightColLastChild) {
      return
    }

    if (
      maxHeightColList.clientHeight - minHeightColList.clientHeight >
      maxHeightColLastChild.clientHeight + verticalSpacing
    ) {
      arrangeData(maxHeightIndex, minHeightIndex);
    }

    setPreColIndex(colDomList);
  }

  useEffect(() => {
    if(!preData.current.length || preData.current.length > data.length) {
      computedData(data, true);
    }else {
      const intersectionData = getIntersection(preData.current, data);
      if(intersectionData.length === preData.current.length) {
        computedData(getDifference(preData.current, data));
      }else {
        computedData(data, true);
      }
    }

    preData.current = data;
  }, [col, data])

  useLayoutEffect(() => {
    computedDom();
  }, [
    colArr,
    horizontalSpacing,
    verticalSpacing,
    waterFallBoxStyle,
    width,
    useWindow,
    CardComponent,
  ])

  useScroll(useWindow, limitHeight, waterFallNode, onReachBottom);

  return (
    <div
      ref={waterFallNode}
      className='waterFall-box'
      style={{
        width, ...waterFallBoxStyle, ...defaultStyle
      }}
    >
      {
        colArr.map((list, listCol) => {
          return (
            <div
              key={listCol}
              className='waterFall-col-box'
              style={{
                'marginRight': listCol === colArr.length - 1 ? "unset" : `${horizontalSpacing}px`,
                'flexGrow': 1,
                'flexShrink': 1
              }}
            >
              {
                list.map((item: any, index: number) => {
                  return (
                    <div
                      className='waterFall-card-box'
                      key={index}
                      style={{
                        'marginBottom': `${verticalSpacing}px`,
                        'overflow': 'hidden'
                      }}
                    >
                      <CardComponent key={index} data={item} index={`${listCol}-${index}`} />
                    </div>
                  )
                })
              }
            </div>
          )
        })
      }
    </div>
  )
}
