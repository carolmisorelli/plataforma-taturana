
if (Meteor.isClient) {
  Template.admSessions.helpers({
    films: function() {
      return Films.all().fetch();
    },
    ambassador_options: function(films) {
      var ambassadorsIds = [],
          ambassadors = [];

      _.each(films, function(film) {
        _.each(film.screening, function(screening) {
          if (screening.user_id) {
            ambassadorsIds.push(screening.user_id);
          }
        });

        ambassadorsIds = _.uniq(ambassadorsIds);

        ambassadors = Meteor.users.find({_id: { $in: ambassadorsIds}}).fetch();
      });

      return _.uniq(ambassadors);
    },
    states_options: function(films) {
      var states = [];

      _.each(films, function(film) {
        _.each(film.screening, function(screening) {
          if (screening.uf) {
            states.push(screening.uf);
          }
        });
      });

      return _.uniq(states);
    },
    cities_options: function(films) {
      var cities = [];

      _.each(films, function(film) {
        _.each(film.screening, function(screening) {
          if (screening.city) {
            cities.push(screening.city);
          }
        });
      });

      return _.uniq(cities);
    },

    // Retorna o nome do embaixador da sessão
    get_name: function(userId) {
      user = Meteor.users.findOne({_id: userId});
      return user.profile.name;
    },

    // Retorna o email do embaixador da sessão
    get_email: function(userId) {
      user = Meteor.users.findOne({_id: userId});
      return user.emails[0].address;
    },

    // Retorna true se a sessão for anterior a data de hoje
    oldSession: function(date) {
      return date < new Date();
    },

    filtered_films: function() {
      // filmes obedecendo filtros
      var films = Films.all().fetch(),
          screenings,
          future_screenings = [],
          filtered_films = [];

      // applica filtros
      var filtered_city = Session.get('city'),
          filtered_state = Session.get('state'),
          filtered_month = String(Session.get('month')),
          filtered_title = Session.get('title'),
          filtered_team  = Session.get('team'),
          filtered_public  = Session.get('public'),
          filtered_comment  = Session.get('comment'),
          filtered_report  = Session.get('report'),
          filtered_ambassador = Session.get('ambassador');

      _.each(films, function(film) {
        screenings = film.screening || [];

        if (!screenings) return;

        _.each(screenings, function(screening) {

          if ((!filtered_city || screening['city'] == filtered_city) &&
              (!filtered_state || screening['uf'] == filtered_state) &&
              (!filtered_ambassador || screening['user_id'] == filtered_ambassador) &&
              (!filtered_month || screening['date'].getMonth() == filtered_month) &&
              (!filtered_team || screening['team_member'] == filtered_team) &&
              (!filtered_public || screening['public_event'] == filtered_public) &&
              (!filtered_report || !screening['real_quorum']) &&
              (!filtered_comment || screening['comments']) &&
              (!filtered_title || film['title'] == filtered_title)) {
            future_screenings.push(screening);
          }
        });

        if (future_screenings.length > 0) {
          film.future_screenings = future_screenings;
          filtered_films.push(film);
          future_screenings = [];
        }
      });

      return filtered_films;
    }
  });

  Template.admSessions.rendered = function() {
    //Deixa o mês ativado.
    $(".btn-datepicker").click(function(){
       $(".btn-datepicker").removeClass("active");
       $(this).addClass("active");
    });
  };

  Template.admSessions.events({
    'change #city-selector': function (e) {
      var city = $(e.currentTarget).val();
      Session.set('city', city);
    },
    'change #st-selector': function (e) {
      var state = $(e.currentTarget).val();
      Session.set('state', state);
    },
    'change #film-selector': function (e) {
      var title = $(e.currentTarget).val();
      Session.set('title', title);
    },
    'change #ambassador-selector': function (e) {
      var ambassador = $(e.currentTarget).val();
      Session.set('ambassador', ambassador);
    },
    'change #team-selector': function (e) {
      Session.set('team', e.currentTarget.checked);
    },
    'change #public-event': function (e) {
      Session.set('public', e.currentTarget.checked);
    },
    'change #comment': function (e) {
      Session.set('comment', e.currentTarget.checked);
    },
    'change #pendingReport': function (e) {
        console.log("reported: " + e.currentTarget.checked);
        Session.set('report', e.currentTarget.checked);
    },
    'click .btn-datepicker': function (e) {
      var month = $(e.currentTarget).data('month');
      Session.set('month', month);
    },
    'click .btn-set-draft': function (e) {
      var id = $(e.currentTarget).data('session-id');
      Meteor.call('setScreeningDraftStatus', id, true);

      FlashMessages.sendSuccess("Sessão salva como rascunho.");
    },
    'click .btn-unset-draft': function (e) {
      var id = $(e.currentTarget).data('session-id');
      Meteor.call('setScreeningDraftStatus', id, false);

      FlashMessages.sendSuccess("Sessão não é mais um rascunho.");
    },
  });
}
