public class App {
    // 简单模拟路线规划：返回两点间的直线距离
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; // 地球半径，单位：公里
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 简单模拟海拔查询：返回一个固定值
    public static double getElevation(double lat, double lon) {
        // 实际项目可调用第三方API，这里返回模拟值
        return 123.45;
    }

    public static void main(String[] args) {
        // 示例：计算北京到上海的距离
        double distance = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737);
        System.out.println("北京到上海的直线距离: " + distance + " km");

        // 示例：查询某点海拔
        double elevation = getElevation(39.9042, 116.4074);
        System.out.println("北京的海拔: " + elevation + " 米");
    }
}
