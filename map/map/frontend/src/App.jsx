import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import './App.css'

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function App() {
  const [fromLat, setFromLat] = useState('39.9042')
  const [fromLon, setFromLon] = useState('116.4074')
  const [toLat, setToLat] = useState('31.2304')
  const [toLon, setToLon] = useState('121.4737')
  const [fromAddress, setFromAddress] = useState('北京市')
  const [toAddress, setToAddress] = useState('上海市')
  const [distance, setDistance] = useState(null)
  const [elevation, setElevation] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])
  const [loading, setLoading] = useState(false)
  const [routeType, setRouteType] = useState('straight') // 'straight' 或 'road'
  const [routeInfo, setRouteInfo] = useState(null) // 存储路线详细信息
  const [inputMode, setInputMode] = useState('address') // 'address' 或 'coordinates'
  const [geocodeLoading, setGeocodeLoading] = useState(false)

  // 球面距离公式（与后端一致）
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  function getElevation(lat, lon) {
    // 模拟海拔，实际可调用后端API
    return 123.45
  }

  // 地理编码：将地址转换为经纬度
  async function geocodeAddress(address) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=zh`
      )
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0]
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          display_name: result.display_name
        }
      } else {
        throw new Error('未找到该地址')
      }
    } catch (error) {
      console.error('地理编码失败:', error)
      throw error
    }
  }

  // 处理地址输入并转换为坐标
  const handleAddressGeocode = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      alert('请输入起点和终点地址')
      return
    }

    setGeocodeLoading(true)
    try {
      // 同时获取起点和终点的坐标
      const [fromResult, toResult] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress)
      ])

      // 更新坐标
      setFromLat(fromResult.lat.toString())
      setFromLon(fromResult.lon.toString())
      setToLat(toResult.lat.toString())
      setToLon(toResult.lon.toString())

      console.log('地理编码成功:')
      console.log('起点:', fromResult.display_name, `(${fromResult.lat}, ${fromResult.lon})`)
      console.log('终点:', toResult.display_name, `(${toResult.lat}, ${toResult.lon})`)

      // 清除之前的路径数据，让用户重新选择路径类型
      setRouteCoords([])
      setDistance(null)
      setRouteInfo(null)
    } catch (error) {
      alert(`地址解析失败: ${error.message}`)
    } finally {
      setGeocodeLoading(false)
    }
  }

  // 直接处理地址输入和路线规划
  const handleAddressRouting = async () => {
    if (!fromAddress.trim() || !toAddress.trim()) {
      alert('请输入起点和终点地址')
      return
    }

    setLoading(true)
    try {
      // 同时获取起点和终点的坐标
      const [fromResult, toResult] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress)
      ])

      // 更新坐标
      const fromLat = fromResult.lat.toString()
      const fromLon = fromResult.lon.toString()
      const toLat = toResult.lat.toString()
      const toLon = toResult.lon.toString()
      
      setFromLat(fromLat)
      setFromLon(fromLon)
      setToLat(toLat)
      setToLon(toLon)
      
      // 直接计算路线
      const straightDistance = calculateDistance(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon))
      setDistance(straightDistance.toFixed(2))
      setElevation(getElevation(Number(fromLat), Number(fromLon)))
      
      if (routeType === 'road') {
        // 获取真实的车辆导航路径
        const routeData = await getRoadRoute(fromLat, fromLon, toLat, toLon)
        setRouteCoords(routeData.coordinates)
        setRouteInfo({
          roadDistance: routeData.distance,
          duration: routeData.duration,
          instructions: routeData.instructions
        })
      } else {
        // 直线路径
        setRouteCoords([[Number(fromLat), Number(fromLon)], [Number(toLat), Number(toLon)]])
        setRouteInfo(null)
      }
      
    } catch (error) {
      alert(`路线规划失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取真实路径规划（使用免费的路径规划服务）
  async function getRoadRoute(fromLat, fromLon, toLat, toLon) {
    try {
      // 方案1: 尝试使用OSRM免费API（无需API密钥）
      const osrmResponse = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&steps=true`
      )
      
      if (osrmResponse.data && osrmResponse.data.routes && osrmResponse.data.routes[0]) {
        const route = osrmResponse.data.routes[0]
        const coords = route.geometry.coordinates
        
        // 获取路线详细信息
        const distance = (route.distance / 1000).toFixed(2) // 转换为公里
        const duration = Math.round(route.duration / 60) // 转换为分钟
        
        console.log(`OSRM精确路线: ${distance}km, 预计${duration}分钟`)
        
        // 转换坐标格式 [lng, lat] -> [lat, lng]
        return {
          coordinates: coords.map(coord => [coord[1], coord[0]]),
          distance: distance,
          duration: duration,
          instructions: route.legs[0]?.steps || []
        }
      }
    } catch (osrmError) {
      console.log('OSRM API调用失败，尝试备用方案:', osrmError.message)
      
      try {
        // 方案2: 使用GraphHopper免费API（每日1000次请求）
        const graphResponse = await axios.get(
          `https://graphhopper.com/api/1/route?point=${fromLat},${fromLon}&point=${toLat},${toLon}&vehicle=car&locale=zh&calc_points=true&debug=true&key=`
        )
        
        if (graphResponse.data && graphResponse.data.paths && graphResponse.data.paths[0]) {
          const path = graphResponse.data.paths[0]
          const distance = (path.distance / 1000).toFixed(2)
          const duration = Math.round(path.time / 60000)
          
          console.log(`GraphHopper精确路线: ${distance}km, 预计${duration}分钟`)
          
          // 解码路径点（简化处理）
          const coords = path.points?.coordinates || []
          
          return {
            coordinates: coords.length > 0 ? coords.map(coord => [coord[1], coord[0]]) : getSimulatedRoute(fromLat, fromLon, toLat, toLon),
            distance: distance,
            duration: duration,
            instructions: path.instructions || []
          }
        }
      } catch (graphError) {
        console.log('GraphHopper API也失败了:', graphError.message)
      }
    }
    
    // 如果所有API都失败，返回模拟路径
    console.log('所有路径规划API都失败，使用模拟路径')
    return {
      coordinates: getSimulatedRoute(fromLat, fromLon, toLat, toLon),
      distance: calculateDistance(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon)).toFixed(2),
      duration: null,
      instructions: []
    }
  }

  // 模拟路径规划（生成曲线路径）
  function getSimulatedRoute(fromLat, fromLon, toLat, toLon) {
    const points = []
    const steps = 10
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps
      const lat = Number(fromLat) + (Number(toLat) - Number(fromLat)) * ratio
      const lon = Number(fromLon) + (Number(toLon) - Number(fromLon)) * ratio
      
      // 添加一些随机偏移模拟真实道路
      const offset = Math.sin(ratio * Math.PI * 3) * 0.1
      points.push([lat + offset, lon + offset * 0.5])
    }
    
    return points
  }

  const handleCalc = async () => {
    setLoading(true)
    const straightDistance = calculateDistance(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon))
    setDistance(straightDistance.toFixed(2))
    setElevation(getElevation(Number(fromLat), Number(fromLon)))
    
    if (routeType === 'road') {
      // 获取真实的车辆导航路径
      const routeData = await getRoadRoute(fromLat, fromLon, toLat, toLon)
      setRouteCoords(routeData.coordinates)
      setRouteInfo({
        roadDistance: routeData.distance,
        duration: routeData.duration,
        instructions: routeData.instructions
      })
    } else {
      // 直线路径
      setRouteCoords([[Number(fromLat), Number(fromLon)], [Number(toLat), Number(toLon)]])
      setRouteInfo(null)
    }
    
    setLoading(false)
  }

  const fromPos = [Number(fromLat), Number(fromLon)]
  const toPos = [Number(toLat), Number(toLon)]
  const center = [(Number(fromLat) + Number(toLat)) / 2, (Number(fromLon) + Number(toLon)) / 2]

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左侧控制面板 */}
      <div className="control-panel" style={{ width: 350, padding: 20, overflow: 'auto' }}>
        <h2>智能地图路线规划</h2>
        
        {/* 输入模式切换 */}
        <div className="input-mode-selector" style={{marginBottom: '15px'}}>
          <label style={{marginRight: '15px'}}>
            <input 
              type="radio" 
              value="address" 
              checked={inputMode === 'address'} 
              onChange={e => setInputMode(e.target.value)}
            /> 📍 地址输入
          </label>
          <label>
            <input 
              type="radio" 
              value="coordinates" 
              checked={inputMode === 'coordinates'} 
              onChange={e => setInputMode(e.target.value)}
            /> 🌐 坐标输入
          </label>
        </div>

        <div>
          {inputMode === 'address' ? (
            // 地址输入模式
            <>
              <label>起点地址: 
                <input 
                  value={fromAddress} 
                  onChange={e => setFromAddress(e.target.value)} 
                  placeholder="例如：北京市天安门广场"
                  style={{width: '200px', marginBottom: '8px'}} 
                />
              </label><br />
              <label>终点地址: 
                <input 
                  value={toAddress} 
                  onChange={e => setToAddress(e.target.value)} 
                  placeholder="例如：上海市外滩"
                  style={{width: '200px', marginBottom: '15px'}} 
                />
              </label><br />
              
              <div className="route-type-selector" style={{marginTop: '15px'}}>
                <label style={{marginRight: '15px'}}>
                  <input 
                    type="radio" 
                    value="straight" 
                    checked={routeType === 'straight'} 
                    onChange={e => setRouteType(e.target.value)}
                  /> 直线路径
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="road" 
                    checked={routeType === 'road'} 
                    onChange={e => setRouteType(e.target.value)}
                  /> 车辆导航
                </label>
              </div>
              
              <button 
                style={{marginTop:10, padding: '8px 16px'}} 
                onClick={handleAddressRouting}
                disabled={loading}
              >
                {loading ? '规划中...' : '🗺️ 规划路线'}
              </button>
            </>
          ) : (
            // 坐标输入模式
            <>
              <label>起点纬度: <input value={fromLat} onChange={e => setFromLat(e.target.value)} style={{width: '100px'}} /></label><br />
              <label>起点经度: <input value={fromLon} onChange={e => setFromLon(e.target.value)} style={{width: '100px'}} /></label><br />
              <label>终点纬度: <input value={toLat} onChange={e => setToLat(e.target.value)} style={{width: '100px'}} /></label><br />
              <label>终点经度: <input value={toLon} onChange={e => setToLon(e.target.value)} style={{width: '100px'}} /></label><br />
              
              <div className="route-type-selector" style={{marginTop: '15px'}}>
                <label>
                  <input 
                    type="radio" 
                    value="straight" 
                    checked={routeType === 'straight'} 
                    onChange={e => setRouteType(e.target.value)}
                  /> 直线路径
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="road" 
                    checked={routeType === 'road'} 
                    onChange={e => setRouteType(e.target.value)}
                  /> 车辆导航（精确路线）
                </label>
              </div>
              
              <button 
                style={{marginTop:10, padding: '8px 16px'}} 
                onClick={handleCalc}
                disabled={loading}
              >
                {loading ? '规划中...' : '计算距离与路径'}
              </button>
            </>
          )}
          

          
          {inputMode === 'coordinates' && (
            <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
              💡 提示：您也可以切换到地址输入模式，直接输入地名进行路线规划
            </div>
          )}
        </div>
        {distance && (
          <div className="result-panel">
            <div>🗺️ 直线距离：<b>{distance}</b> km</div>
            {routeInfo && routeInfo.roadDistance && (
              <div>🚗 实际路线：<b>{routeInfo.roadDistance}</b> km</div>
            )}
            {routeInfo && routeInfo.duration && (
              <div>⏱️ 预计时间：<b>{routeInfo.duration}</b> 分钟</div>
            )}
            <div>⛰️ 起点海拔：<b>{elevation}</b> 米</div>
            <div>🛣️ 路径类型：<b>{routeType === 'straight' ? '直线' : '车辆导航'}</b></div>
            <div>📍 路径点数：<b>{routeCoords.length}</b></div>
            {routeInfo && routeInfo.instructions && routeInfo.instructions.length > 0 && (
              <div style={{marginTop: '10px', fontSize: '13px'}}>
                <div><b>🧭 导航指令：</b></div>
                <div style={{maxHeight: '120px', overflowY: 'auto', marginTop: '5px'}}>
                  {routeInfo.instructions.slice(0, 5).map((step, index) => (
                    <div key={index} style={{margin: '3px 0', padding: '3px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px'}}>
                      {step.instruction || `步骤 ${index + 1}`}
                    </div>
                  ))}
                  {routeInfo.instructions.length > 5 && (
                    <div style={{fontStyle: 'italic', opacity: 0.8}}>...还有 {routeInfo.instructions.length - 5} 个步骤</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 右侧地图 */}
      <div style={{ flex: 1 }}>
        <MapContainer 
          center={center} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* 起点标记 */}
          <Marker position={fromPos}>
            <Popup>
              起点: {inputMode === 'address' ? fromAddress : '自定义位置'}<br />
              纬度: {fromLat}<br />
              经度: {fromLon}
            </Popup>
          </Marker>
          
          {/* 终点标记 */}
          <Marker position={toPos}>
            <Popup>
              终点: {inputMode === 'address' ? toAddress : '自定义位置'}<br />
              纬度: {toLat}<br />
              经度: {toLon}
            </Popup>
          </Marker>
          
          {/* 路径线 */}
          {routeCoords.length > 0 && (
            <Polyline 
              positions={routeCoords} 
              color={routeType === 'straight' ? 'red' : 'blue'} 
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default App
