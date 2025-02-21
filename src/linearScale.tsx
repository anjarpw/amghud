import React, { useEffect, useState } from "react";
import { G, Path, Text, SvgXml, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { ColorValue } from "react-native";



export type LinearScaleProps = {
    size: number
    markers: number[]
    majorMarkers: number[]
    majorRuleSize: number
    superMajorMarkers?: number[]
}

const LinearScale = (props: LinearScaleProps) => {
    const { markers, size, majorMarkers, majorRuleSize, superMajorMarkers } = props
    const markerDesigns: Record<number, number> = {}
    markers.forEach(x => {
        markerDesigns[x] = majorRuleSize / 2
    })
    majorMarkers.forEach(x => {
        markerDesigns[x] = majorRuleSize
    })
    superMajorMarkers?.forEach(x => {
        markerDesigns[x] = majorRuleSize*2
    })

    const pathD: string[] = []
    const min = markers.reduce((prev, curr) => prev < curr ? prev : curr, 0)
    const max = markers.reduce((prev, curr) => prev > curr ? prev : curr, 0)

    console.log(min, max)
    Object.keys(markerDesigns).map((marker: string) => {
        console.log(marker)
        const markerValue = parseInt(marker)
        if (isNaN(markerValue)) {
            return
        }
        const x = size * (markerValue-min) / (max - min)
        const y1 = 0
        const y2 = markerDesigns[markerValue]
        pathD.push(`M ${x} ${y1} L ${x} ${y2}`)
    })

    return (<>
        {/* <Rect x="0" y="0" width={size} height={majorRuleSize} fill="red" /> */}
        <Path d={pathD.join(' ')} fill="none" stroke="white" strokeWidth="2" />
    </>)
}

export default LinearScale