import React, { } from "react";
import { Path, } from "react-native-svg";



export type LinearScaleProps = {
    size: number
    markers: number[]
    majorMarkers: number[]
    majorRuleSize: number
    superMajorMarkers?: number[]
    hasLateralLine?: boolean
}

const LinearScale = (props: LinearScaleProps) => {
    const { markers, size, majorMarkers, majorRuleSize, superMajorMarkers, hasLateralLine } = props
    const markerDesigns: Record<string, number> = {}
    markers.forEach(x => {
        markerDesigns[x.toFixed(2)] = majorRuleSize / 2
    })
    majorMarkers.forEach(x => {
        markerDesigns[x.toFixed(2)] = majorRuleSize
    })
    superMajorMarkers?.forEach(x => {
        markerDesigns[x.toFixed(2)] = majorRuleSize * 2
    })

    const pathD: string[] = []
    const min = markers.reduce((prev, curr) => prev < curr ? prev : curr, 0)
    const max = markers.reduce((prev, curr) => prev > curr ? prev : curr, 0)

    Object.keys(markerDesigns).map((marker: string) => {
        const markerValue = parseFloat(marker)
        if (isNaN(markerValue)) {
            return
        }
        const x = size * (markerValue - min) / (max - min)
        const y1 = 0
        const y2 = markerDesigns[marker]
        pathD.push(`M ${x} ${y1} L ${x} ${y2}`)
    })
    if (hasLateralLine) {
        pathD.push(`M 0 0 L ${size} 0`)
    }

    return (<>
        {/* <Rect x="0" y="0" width={size} height={majorRuleSize} fill="red" /> */}
        <Path d={pathD.join(' ')} fill="none" stroke="white" strokeWidth="2" />
    </>)
}

export default LinearScale