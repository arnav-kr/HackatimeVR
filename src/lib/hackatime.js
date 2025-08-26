export default class Hackatime {
  constructor(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    this.apiUrl = 'https://hackatime.hackclub.com/api/v1/';
    this.userId = userId;
    this.lastUpdated = null;
  }

  async _fetch(path) {
    const response = await fetch(`${this.apiUrl}${path}`);
    const json = await response.json();
    this.lastUpdated = Date.now();
    return json.data;
  }

  async overview() {
    const data = await this._fetch(`users/${this.userId}/stats`);
    let overview = {
      total_time: data.human_readable_total,
      daily_average: data.human_readable_daily_average,
      favourite: data.languages[0].name,
      top_languages: data.languages.map(lang => {
        return {
          name: lang.name,
          hours: (lang.total_seconds / 3600).toFixed(2)
        };
      }).slice(0, 5)
    };
    return overview;
  }

  async current() {
    const res = await fetch(`${window.location.origin}/api/current-active`);
    const data = await res.json();
    this.lastUpdated = Date.now();
    return data.count;
  }
  // $("body main>div>div:nth-child(2)>div>div:nth-child(1)")
  async leaderboard(period = "daily", scope = "regional") {
    let data = [];
    const res = await fetch(`${window.location.origin}/api/leaderboard?period=${period}&scope=${scope}`);
    const html = await res.text();
    const dom = new DOMParser().parseFromString(html, "text/html");
    const leaderboardContainer = dom.querySelector("body main>div>div:nth-child(2)>div");
    const n = leaderboardContainer.childElementCount < 10 ? leaderboardContainer.childElementCount : 10;
    window.user = []
    for (let i = 0; i < n; i++) {
      const user = leaderboardContainer.children[i];
      window.user[i] = user;
      const username = user.querySelector("img+span").innerText;
      const avatar = user.querySelector("img").src;
      const hours = user.querySelector("div.flex-shrink-0.font-mono.text-sm:last-child").innerText.trim();
      const profileUrl = user.querySelector("a") ? user.querySelector("a").href : null;
      const country = user.querySelector("span[title]") ? user.querySelector("span[title]").innerText : "";
      data.push({ username, avatar, profileUrl, hours, country });
    }
    this.lastUpdated = Date.now();
    return data;
  }

  async _getDailyData(dayOffset) {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - dayOffset);
    const startDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    let endDateObj = new Date(date);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDate = `${endDateObj.getFullYear()}-${endDateObj.getMonth() + 1}-${endDateObj.getDate()}`;

    const data = await this._fetch(`users/${this.userId}/stats?start_date=${startDate}&end_date=${endDate}`);
    const locale = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : 'en-US';
    const totalSeconds = data && typeof data.total_seconds === 'number' ? data.total_seconds : 0;
    const humanReadable = data && typeof data.human_readable_total === 'string' ? data.human_readable_total : "0h";
    return {
      days: date.toLocaleDateString(locale, { weekday: 'long' }),
      time: (totalSeconds / 3600).toFixed(2),
      legend: humanReadable === "" ? "0h" : humanReadable
    };
  }
  async _lastWeekStats() {
    let res = []
    for (let i = 0; i < 7; i++) {
      const data = await this._getDailyData(i);
      res.push(data);
    }
    res.reverse();
    return res;
  }
  async _getWeeklyData(weekOffset) {
    let endDate = new Date();
    endDate.setDate(endDate.getDate() - weekOffset * 7);
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - (weekOffset + 1) * 7);
    startDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)}-${startDate.getDate()}`;
    endDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)}-${endDate.getDate()}`;
    const data = await this._fetch(`users/${this.userId}/stats?start_date=${startDate}&end_date=${endDate}`);
    const locale = (typeof navigator !== "undefined" && navigator.language) ? navigator.language : 'en-US';
    return {
      x_axis: `${new Date(startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`,
      time: (data.total_seconds / 3600).toFixed(2),
      label: data.human_readable_total == "" ? "0h" : data.human_readable_total
    };
  }

  async _getNWeekData(n) {
    let res = [];
    for (let i = 0; i < n; i++) {
      const data = await this._getWeeklyData(i);
      res.push(data);
    }
    return res;
  }


  async range(duration) {
    if (!duration) {
      throw new Error('Duration is required');
    }
    if (!["7days", "1month", "3months"].includes(duration)) {
      throw new Error('Invalid duration');
    }
    switch (duration) {
      case "7days":
        return this._lastWeekStats();
      case "1month":
        return this._getNWeekData(4);
      case "3months":
        return this._getNWeekData(12);
    }
  }

}