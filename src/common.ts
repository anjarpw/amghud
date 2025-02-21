export type DrivingMode = 'T' | 'P' | 'R' | 'D' | 'S' | 'S+'

export type CarStats = {
    cumulatedPower: number,
    mode: DrivingMode
}