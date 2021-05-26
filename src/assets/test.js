Vue.config.devtools = window.location.hostname === 'localhost';

Vue.use(VueGtag, {
  config: { id: document.head.getAttribute('data-ga-id') },
  disableScriptLoad: true
});

var c19CheckApp = new Vue({
  el: '#c19-check-app',
  delimiters: ['${', '}'],
  data: {
    forms: [],
    steps: [],
    currentPhase: null,
    termsAccepted: false,
    responses: {
      symptom_multiple_choice: [],
      exposure_place_multiple_choice: [],
      exposure_person_multiple_choice: [],
      condition_multiple_choice: []
    },
    responsesFormatted: [],
    results: {},
    tips: {}
  },
  created: function() {
    this.showBanner();
    this.fetchData();
  },
  watch: {
    termsAccepted: function() {
      this.currentPhase = this.termsAccepted ? 0 : null;
    },
    currentPhase: function() {
      if (this.currentPhase === this.forms.length) { this.checkResponses(); }
    }
  },
  computed: {
    phaseDone: function() {
      return this.currentPhase === this.forms.length;
    }
  },
  methods: {
    showBanner: function() {
      var message = 'Contribute on GitHub: https://github.com/codeforvision/covid19-az',
          style   = 'background: #040f0f; color: #2ba84a';
      console.log(`%c ${message}`, style);
    },
    track: function(action, category, label, value) {
      this.$gtag.event(action, {
        event_category: category,
        event_label: label,
        value: value
      });
    },
    submitDisabled: function(phase) {
      if (this.responses[phase] === undefined) { return true; }
      if (this.responses[phase].length === 0) { return true; }
    },
    checkInclusive: function(event) {
      var phase = event.target.name,
          self = this,
          index;

      this.$refs.exclusive.forEach(function(item) {
        if (item.checked && item._value !== event.target._value) {
          index = self.responses[phase].indexOf(item._value);
          self.responses[phase].splice(index, 1);
        }
      });
      this.track('choose_answer', 'responses', phase, event.target._value);
    },
    checkExclusive: function(event) {
      this.responses[event.target.name] = [event.target._value];
      this.track('choose_answer', 'responses', event.target.name, event.target._value);
    },
    iid: function(key, index) {
      return `${key}_${index}`;
    },
    fetchData: function() {
      var self = this;
      fetch('/covid19-az/data/test.json')
        .then(function(response) {
          return response.json();
        }).then(function(json) {
          self.forms = json.forms;
          self.steps = json.steps;
          self.tips = json.tips;
        }).catch(function(err) {
          self.$gtag.exception({
            description: `request_failed: ${err}`,
            fatal: true
          });
        });
    },
    r01: function () {
      return {
        tip: this.tips.r01,
        needs: [this.steps.j, this.steps.g, this.steps.f, this.steps.c]
      };
    },
    r02: function() {
      return {
        tip: this.tips.r02,
        needs: [this.steps.g, this.steps.f, this.steps.i, this.steps.h, this.steps.a]
      };
    },
    r03: function() {
      return {
        tip: this.tips.r03,
        needs: [this.steps.g, this.steps.f, this.steps.a, this.steps.c]
      };
    },
    r04: function() {
      return {
        tip: this.tips.r04,
        needs: [this.steps.g, this.steps.f, this.steps.c],
        nonNeeds: [this.steps.b]
      };
    },
    r05: function() {
      return {
        tip: this.tips.r05,
        needs: [this.steps.g, this.steps.f, this.steps.c]
      };
    },
    r06: function(isOlder, hasConditions) {
      return {
        tip: this.tips.r06,
        needs: [this.steps.e].concat(isOlder || hasConditions ? [this.steps.k] : []),
        nonNeeds: [this.steps.b]
      };
    },
    r07: function() {
      return {
        tip: this.tips.r07,
        needs: [this.steps.l, this.steps.e, this.steps.d],
        nonNeeds: [this.steps.b]
      };
    },
    r08: function() {
      return {
        tip: this.tips.r08,
        needs: [this.steps.m, this.steps.d],
        nonNeeds: [this.steps.b]
      };
    },
    r09: function() {
      return {
        tip: this.tips.r09,
        needs: [this.steps.g, this.steps.f, this.steps.i, this.steps.h]
      };
    },
    checkResponses: function() {
      var r = this.responses;
      var hasTraveled = r.travel_single_choice === 0;
      var hasPersonExposure = r.exposure_person_multiple_choice.indexOf(0) !== -1 ||
                              r.exposure_person_multiple_choice.indexOf(1) !== -1;
      var hasPlaceExposure = r.exposure_place_multiple_choice.indexOf(0) !== -1 ||
                             r.exposure_place_multiple_choice.indexOf(1) !== -1;
      var hasNoPlaceExposure = r.exposure_place_multiple_choice.indexOf(3) !== -1;
      var isExposed = hasTraveled || hasPlaceExposure || hasPersonExposure;
      var hasNoSymptoms = r.symptom_multiple_choice.indexOf(6) !== -1;
      var hasSymptoms = !(hasNoSymptoms ||
                          r.symptom_multiple_choice.indexOf(0) !== -1 ||
                          r.symptom_multiple_choice.indexOf(1) !== -1 ||
                          r.symptom_multiple_choice.indexOf(2) !== -1);
      var hasConditions = !(r.condition_multiple_choice.indexOf(9) !== -1);
      var isWorkedInCareFacility = r.care_facility_single_choice === 1 ||
                                   r.care_facility_single_choice === 2;
      var isLivingInCareFacility = r.care_facility_single_choice === 0;
      var isOlder = r.age_single_choice === 2;

      this.responsesFormatted.push(hasNoSymptoms ? 'Simptomlarınız yoxdur' : 'Simptomlarınız var');
      this.responsesFormatted.push(hasConditions ? 'Müvafiq hallarınız var' : 'Müvafiq hallarınız yoxdur');
      this.responsesFormatted.push(hasTraveled ? 'Siz xaricə səyahət etmisiniz' : 'Siz xaricə səyahət etməmisiniz');

      if (hasPlaceExposure) {
        this.responsesFormatted.push('Siz geniş yayılmış ərazidə olmusunuz');
      } else if (hasNoPlaceExposure) {
        this.responsesFormatted.push('Siz geniş yayılmış ərazidə olmamısınız');
      }

      this.responsesFormatted.push(hasPersonExposure ? 'Xəstə olan başqaları ilə təmasda olmusunuz' : 'Xəstə olan başqaları ilə təmasda olmamısınız');

      if ((isWorkedInCareFacility || isLivingInCareFacility)) {
        this.responsesFormatted.push('Tibb müəssisəsində yaşayırsınız və ya işləyirsiniz');
      } else {
        this.responsesFormatted.push('Tibb müəssisəsində yaşamırsınız və ya işləmirsiniz');
      }

      var self = this;
      this.results = (function() {
        if (hasNoSymptoms) {
          if (isWorkedInCareFacility) {
            if (hasTraveled || hasPersonExposure) { return self.r07(); }
            return self.r06(isOlder, hasConditions);
          }

          if (isExposed) { return self.r08(); }
          return self.r06(isOlder, hasConditions);
        }

        if (isExposed) {
          if (isLivingInCareFacility) { return self.r01(); }
          if (isWorkedInCareFacility) { return self.r02(); }
          if (hasConditions || isOlder && !hasSymptoms) { return self.r03(); }
          if (!isOlder && hasSymptoms) { return self.r04(); }
          return self.r05();
        }

        if (isWorkedInCareFacility && !hasNoSymptoms) {
          if (hasSymptoms) { return self.r09(); }
          return self.r02();
        }

        if (isLivingInCareFacility) { return self.r01(); }

        if (isOlder) {
          if (hasConditions) {
            if (hasSymptoms) { return self.r05(); }
            return self.r03();
          }

          if (hasSymptoms) { return self.r04(); }
          return self.r05();
        }

        if (hasConditions) {
          if (hasSymptoms) { return self.r05(); }
          return self.r03();
        }

        return self.r04();
      })();
    }
  }
});
