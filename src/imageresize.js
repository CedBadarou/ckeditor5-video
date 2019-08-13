/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResizer from '@ckeditor/ckeditor5-widget/src/widgetresizer';

/**
 *	Image resize plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetResizer ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResize';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.editing.downcastDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			const resizer = editor.plugins
				.get( WidgetResizer )
				.attachTo( {
					modelElement: data.item,
					viewElement: widget,
					downcastWriter: conversionApi.writer,
					getResizeHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'img' );
					},
					getAspectRatio( domResizeHost ) {
						return domResizeHost.naturalWidth / domResizeHost.naturalHeight;
					},
					isCentered() {
						const imageStyle = data.item.getAttribute( 'imageStyle' );

						return !imageStyle || imageStyle == 'full';
					}
				} );

			resizer.on( 'begin', () => {
				resizer._temporaryResizeClassAdded = !resizer.domResizeWrapper.parentElement.classList.contains( 'ck_resized' );
			}, { priority: 'high' } );

			resizer.on( 'updateSize', () => {
				if ( resizer._temporaryResizeClassAdded ) {
					resizer.domResizeWrapper.parentElement.classList.add( 'ck_resized' );
				}
			} );

			resizer.on( 'cancel', () => {
				if ( resizer._temporaryResizeClassAdded ) {
					resizer.domResizeWrapper.parentElement.classList.remove( 'ck_resized' );
				}
			} );
		}, {
			priority: 'low'
		} );

		this._registerSchema();
		this._registerConverters();
	}

	/**
	 * @private
	 */
	_registerSchema() {
		this.editor.model.schema.extend( 'image', {
			allowAttributes: 'width'
		} );
	}

	/**
	 * Registers image resize converters.
	 *
	 * @private
	 */
	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate image's attribute to the img tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:width:image', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );
				const img = figure.getChild( 0 );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, img );
					viewWriter.addClass( 'ck_resized', figure );
				} else {
					viewWriter.removeStyle( 'width', img );
					viewWriter.removeClass( 'ck_resized', figure );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'width',
					value: viewElement => viewElement.getStyle( 'width' )
				}
			} );
	}
}