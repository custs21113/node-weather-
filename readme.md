### initialize
    // 初始化获取省份页面连接
    hostname:port/getProvinceUrls
    eg: http://localhost:3004/getProvinceUrls

    // 初始化获取各省份的城市信息
    hostname:port/stepCities
    eg: http://localhost:3004/stepCities
### usage
    // 获取所有可以查询天气的省份信息
    hostname:port/getProvinces
    eg: http://localhost:3004/getProvinces

    // 获取响应省份的城市信息
    hostname:port/provinces/:provIndex
    eg: http://localhost:3004/provinces/浙江
    
    // 获取城市的天气信息
    hostname:port/city/:cityID
    eg: http://localhost:3004/city/58457