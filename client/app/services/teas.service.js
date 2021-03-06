export default class Teas {
  constructor($http, $q) {
    'ngInject';

    this._$http = $http;
    this._$q = $q;
    this.list = null;
    this.currentTeas = this.list;
    this.currentCategory = 'All';
    this.checkedCaffeineLevel = [];
    this.getAllTeas();
  }

  getAllTeas() {
    if (this.list !== null) {
      return this._$q.resolve(this.list);
    }

    return this._$http.get("http://localhost:8080")
      .then((response) => {
        this.list = response.data.teas;
        this.currentTeas = this.list;
        return this.list;
      });
  }

  getExpensiveTeas(top) {
    return this.getAllTeas().then((teas) => {
      return teas.sort((a, b) => b.price - a.price).slice(0, top);
    })
  }

  getTeaById(id) {
    return this.getAllTeas().then((teas) => {
      return teas.filter(t => t._id == id)[0];
    })
  }

  getTeaTypes() {
    return this.getAllTeas().then((teas) => {
      const teaTypes = ['All'];
      teas.filter(t => {
        return teaTypes.indexOf(t.teaType) == -1 && teaTypes.push(t.teaType);
      });
      return teaTypes;
    });
  }


  getTeasByCategory(category) {
    this.currentCategory = category;

    if (category == 'All') {
      return this.getAllTeas().then((teas) => {
        this.currentTeas = teas;
        return this.currentTeas;
      });
    }
    else {
      return this.getAllTeas().then((teas) => {
        this.currentTeas = teas.filter(t=> t.teaType == category);
        return this.currentTeas;
      });
    }
  }

  search(searchString) {
    if (searchString == "")
      this.getTeasByCategory(this.currentCategory).then(teas => {
        this.currentTeas = teas;
        this.filterByCaffeineLevel();
      });
    else {
      this.getTeasByCategory(this.currentCategory).then(teas => {
        this.currentTeas = teas.filter(t =>
          t.name.toLowerCase().includes(searchString));
      });
    }
  }

  getAvailableCaffeineLevel() {
    return this.currentTeas.reduce((c, tea) => {
      if (!c.find(l => l.level == tea.caffeineLevel))
        c.push({level: tea.caffeineLevel, checked: false});

      return c;
    }, []);
  }

  filterByCaffeineLevel(caffeineLevel, checked) {
    if (checked)
      this.checkedCaffeineLevel.push(caffeineLevel);
    else {
      const indexToRemove = this.checkedCaffeineLevel.indexOf(caffeineLevel);
      if (indexToRemove != -1)
        this.checkedCaffeineLevel.splice(indexToRemove, 1);
    }

    if (this.checkedCaffeineLevel.length != 0) {
      this.getTeasByCategory(this.currentCategory).then(list => {
        this.currentTeas = list.reduce((teas, tea) => {
          if (this.checkedCaffeineLevel.includes(tea.caffeineLevel))
            teas.push(tea);
          return teas;
        }, []);
      });
    }
    else {
      this.getTeasByCategory(this.currentCategory).then(list => {
        this.currentTeas = list;
      });
    }
  }
}
