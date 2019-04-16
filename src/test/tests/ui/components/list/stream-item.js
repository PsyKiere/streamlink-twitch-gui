import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import StreamItemComponent from "ui/components/list/stream-item/component";
import {
	ATTR_FILTER_LANGUAGES_NOOP,
	ATTR_FILTER_LANGUAGES_FADE,
	ATTR_FILTER_LANGUAGES_FILTER
} from "data/models/settings/streams/fragment";


// TODO: finish stream-item-component tests
module( "ui/components/list/stream-item", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			StreamItemComponent: StreamItemComponent.extend({
				// remove layout for now
				layout: hbs``
			})
		})
	});

	hooks.beforeEach(function() {
		this.owner.register( "service:settings", Service.extend({
			content: {
				streams: {
					filter_languages: ATTR_FILTER_LANGUAGES_FADE,
					filter_vodcast: false,
					language: "en"
				}
			}
		}) );
	});


	test( "faded", function( assert ) {
		const Subject = this.owner.factoryFor( "component:stream-item" );
		const subject = Subject.create({
			content: {
				channel: {
					language: undefined,
					broadcaster_language: undefined
				}
			}
		});

		assert.notOk( subject.faded, "Not faded if channel language is missing" );

		set( subject, "content.channel.language", "en" );
		assert.notOk( subject.faded, "Not faded if broadcaster language is missing" );

		set( subject, "content.channel.broadcaster_language", "en" );
		assert.notOk( subject.faded, "Not faded if broadcaster language is equal" );

		set( subject, "content.channel.language", "other" );
		assert.notOk( subject.faded, "Not faded if language differs" );

		set( subject, "content.channel.broadcaster_language", "other" );
		assert.ok( subject.faded, "Faded if broadcaster language differs" );

		set( subject, "settings.content.streams.filter_languages", ATTR_FILTER_LANGUAGES_FILTER );
		assert.notOk( subject.faded, "Not faded if filtering is enabled" );

		set( subject, "settings.content.streams.filter_languages", ATTR_FILTER_LANGUAGES_NOOP );
		assert.notOk( subject.faded, "Not faded if fading is disabled" );

		set( subject, "settings.content.streams.filter_languages", ATTR_FILTER_LANGUAGES_FADE );
		assert.ok( subject.faded, "Faded again if fading is enabled" );

		set( subject, "ignoreLanguageFading", true );
		assert.notOk( subject.faded, "Not faded anymore if ignoreLanguageFading is true" );
	});


	test( "fadedVodcast", function( assert ) {
		const Subject = this.owner.factoryFor( "component:stream-item" );
		const subject = Subject.create({
			content: {
				isVodcast: false
			}
		});

		assert.notOk( subject.fadedVodcast, "Not faded if it's not a vodcast" );

		set( subject, "content.isVodcast", true );
		assert.notOk( subject.fadedVodcast, "Not faded if vodcast filtering is disabled" );

		set( subject, "settings.content.streams.filter_vodcast", true );
		assert.ok( subject.fadedVodcast, "Faded if vodcast filtering is enabled" );

		set( subject, "content.isVodcast", false );
		assert.notOk( subject.fadedVodcast, "Not faded if not a vodcast anymore" );
	});


	test( "isFaded element class", async function( assert ) {
		const SettingsService = this.owner.lookup( "service:settings" );
		this.setProperties({
			ignoreLanguageFading: false,
			content: {
				isVodcast: false,
				channel: {
					language: "en"
				}
			}
		});
		await render( hbs`
			{{stream-item content=content ignoreLanguageFading=ignoreLanguageFading}}
		` );
		const elem = this.element.querySelector( ".stream-item-component" );

		assert.notOk(
			elem.classList.contains( "faded" ),
			"Not faded if faded and fadedVodcast are false"
		);

		run( () => {
			set( this, "content.isVodcast", true );
			set( SettingsService, "content.streams.filter_vodcast", true );
		});
		assert.ok( elem.classList.contains( "faded" ), "Faded if fadedVodcast is true" );

		run( () => {
			set( this, "content.channel.language", "other" );
		});
		assert.ok( elem.classList.contains( "faded" ), "Faded if faded and fadedVodcast are true" );

		run( () => {
			set( this, "content.isVodcast", false );
		});
		assert.ok( elem.classList.contains( "faded" ), "Faded if faded is true" );

		run( () => {
			set( this, "ignoreLanguageFading", true );
		});
		assert.notOk( elem.classList.contains( "faded" ), "Not faded if ignoreLanguageFading" );
	});

});
