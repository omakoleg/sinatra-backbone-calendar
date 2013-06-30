$(function(){

    function createDateAsUTC(date) {
        if(date)
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        else
            return date;
    }

    var Event = Backbone.Model.extend();
 
    var Events = Backbone.Collection.extend({
        model: Event,
        url: 'events'
    });

    var EventView = Backbone.View.extend({
        el: $('#eventDialog'),
        initialize: function() {
            _.bindAll(this);
        },
        render: function() {
            var buttons = {'Ok': this.save};
            if (!this.model.isNew()) {
                _.extend(buttons, {'Delete': this.destroy});
            }
            _.extend(buttons, {'Cancel': this.close});

            this.$el.dialog({
                modal: true,
                title: (this.model.isNew() ? 'New' : 'Edit') + ' Event',
                open: this.open,
                buttons: buttons
            });
     
            return this;
        },
        open: function() {
            this.$('#title').val(this.model.get('title'));
            this.$('#color').val(this.model.get('color'));
        },
        close: function() {
            this.$el.dialog('close');
        },
        save: function() {
            this.model.set({
                'title': this.$('#title').val(), 
                'color': this.$('#color').val()
            });
            if (this.model.isNew()) {
                this.collection.create(this.model, {success: this.close});
            } else {
                this.model.save({}, {success: this.close});
            }
        },
        destroy: function() {
            this.model.destroy({success: this.close});
        }
    });
 
    var EventsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this);

            this.eventView = new EventView();
 
            this.collection.bind('reset', this.addAll);
            this.collection.bind('add', this.addOne);
            this.collection.bind('change', this.change);
            this.collection.bind('destroy', this.destroy);
        },
        render: function() {
            $(this.el).fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay',
                    ignoreTimezone: false
                },
                selectable: true,
                selectHelper: true,
                select: this.select,
                eventClick: this.eventClick,
                eventDrop: this.eventDropOrResize,
                eventResize: this.eventDropOrResize,
                editable: true
            });
        },
        eventDropOrResize: function(fcEvent) {
            this.collection.get(fcEvent.id).save({start: createDateAsUTC(fcEvent.start), end: createDateAsUTC(fcEvent.end)});
        },
        select: function(startDate, endDate) {
            this.eventView.collection = this.collection;
            this.eventView.model = new Event({start: createDateAsUTC(startDate), end: createDateAsUTC(endDate)});
            this.eventView.render();
        },
        eventClick: function(fcEvent) {
            this.eventView.model = this.collection.get(fcEvent.id);
            this.eventView.render();
        },
        addAll: function(){
            this.$el.fullCalendar('addEventSource', this.collection.toJSON());
        },
        addOne: function(event) {
            this.$el.fullCalendar('renderEvent', event.toJSON());
        },
        destroy: function(event) {
            this.$el.fullCalendar('removeEvents', event.id);
        },
        change: function(event) {
            var fcEvent = this.$el.fullCalendar('clientEvents', event.get('id'))[0];
            fcEvent.title = event.get('title');
            fcEvent.color = event.get('color');
            this.$el.fullCalendar('updateEvent', fcEvent);
        }
    });
 
    var events = new Events();
    new EventsView({el: $("#calendar"), collection: events}).render();
    events.fetch();
});