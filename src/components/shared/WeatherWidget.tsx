import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WEATHER_DATA } from "@/data/mockData";

export function WeatherWidget() {
  const { current, forecast, alerts, sunrise, sunset } = WEATHER_DATA;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Alert banner */}
        {alerts.map((alert, i) => (
          <div key={i} className="bg-accent/20 border-b border-accent/30 px-4 py-2 flex items-center gap-2">
            <span>{alert.icon}</span>
            <span className="text-xs text-accent-foreground font-medium">{alert.message}</span>
          </div>
        ))}
        {/* Current weather */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-agro-sky/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{current.temp}°</span>
                <span className="text-muted-foreground text-sm">C</span>
              </div>
              <div className="text-sm text-muted-foreground">{current.condition}</div>
            </div>
            <span className="text-5xl">{forecast[0].icon}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center"><div className="text-xs text-muted-foreground">Humidity</div><div className="text-sm font-medium">{current.humidity}%</div></div>
            <div className="text-center"><div className="text-xs text-muted-foreground">Wind</div><div className="text-sm font-medium">{current.wind} km/h</div></div>
            <div className="text-center"><div className="text-xs text-muted-foreground">Sunrise</div><div className="text-sm font-medium">{sunrise}</div></div>
            <div className="text-center"><div className="text-xs text-muted-foreground">Sunset</div><div className="text-sm font-medium">{sunset}</div></div>
          </div>
        </div>
        {/* 5-day forecast */}
        <div className="px-4 py-3 grid grid-cols-5 gap-1 border-t border-border">
          {forecast.map((day) => (
            <div key={day.day} className="text-center">
              <div className="text-xs text-muted-foreground">{day.day}</div>
              <div className="text-xl my-1">{day.icon}</div>
              <div className="text-xs font-medium">{day.high}°</div>
              <div className="text-xs text-muted-foreground">{day.low}°</div>
              {day.rain > 30 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5 border-agro-sky text-agro-sky">
                  {day.rain}%
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
