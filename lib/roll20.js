/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
 spawnFxBetweenPoints */
'use strict';
const _ = require('underscore');
// noinspection JSUnusedGlobalSymbols
module.exports = {

  getState: function getState(module) {
    if (!state[module]) {
      state[module] = {};
    }
    return state[module];
  },

  createObj: function createObj(type, attributes) {
    return createObj(type, attributes);
  },

  findObjs: function findObjs(attributes) {
    return findObjs(attributes);
  },

  getObj: function getObj(type, id) {
    return getObj(type, id);
  },

  getOrCreateObj: function getOrCreateObj(type, attributes) {
    const newAttributes = _.extend(_.clone(attributes), { type });
    const existing = this.findObjs(newAttributes);
    switch (existing.length) {
      case 0:
        return this.createObj(type, newAttributes);
      case 1:
        return existing[0];
      default:
        throw new Error(`Asked for a single ${type} but more than 1 was found matching attributes: ` +
          `${JSON.stringify(attributes)}`);
    }
  },

  getAttrByName: function getAttrByName(character, attrName) {
    return getAttrByName(character, attrName);
  },

  getAttrObjectByName: function getAttrObjectByName(character, attrName) {
    const attr = this.findObjs({ type: 'attribute', characterid: character, name: attrName });
    return attr && attr.length > 0 ? attr[0] : null;
  },

  getOrCreateAttr: function getOrCreateAttr(characterId, attrName) {
    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName });
  },

  setAttrByName: function setAttrByName(characterId, attrName, value) {
    this.getOrCreateAttr(characterId, attrName).set('current', value);
  },

  processAttrValue: function processAttrValue(characterId, attrName, cb) {
    const attribute = this.getOrCreateAttr(characterId, attrName);
    attribute.set('current', cb(attribute.get('current')));
  },

  getRepeatingSectionAttrs: function getRepeatingSectionAttrs(characterId, sectionName) {
    const prefix = `repeating_${sectionName}`;
    return _.filter(this.findObjs({ type: 'attribute', characterid: characterId }),
      attr => attr.get('name').indexOf(prefix) === 0);
  },

  getRepeatingSectionItemIdsByName: function getRepeatingSectionItemIdsByName(characterId, sectionName) {
    const re = new RegExp(`repeating_${sectionName}_([^_]+)_name$`);
    return _.reduce(this.getRepeatingSectionAttrs(characterId, sectionName),
      (lookup, attr) => {
        const match = attr.get('name').match(re);
        if (match) {
          lookup[attr.get('current').toLowerCase()] = match[1];
        }
        return lookup;
      }, {});
  },

  getCurrentPage: function getCurrentPage(playerId) {
    let pageId;
    if (this.playerIsGM(playerId)) {
      pageId = this.getObj('player', playerId).get('lastpage');
    } else {
      pageId = this.getCampaign().get('playerspecificpages')[playerId] || this.getCampaign().get('playerpageid');
    }

    return pageId ? this.getObj('page', pageId) : null;
  },

  spawnFx: function spawnFx(pointsArray, fxType, pageId) {
    switch (pointsArray.length) {
      case 1:
        spawnFx(pointsArray[0].x, pointsArray[0].y, fxType, pageId);
        break;
      case 2:
        spawnFxBetweenPoints(pointsArray[0], pointsArray[1], fxType, pageId);
        break;
      default:
        throw new Error('Wrong number of points supplied to spawnFx: $$$', pointsArray);
    }
  },

  playerIsGM: function playerIsGM(playerId) {
    return playerIsGM(playerId);
  },

  getCampaign: function getCampaign() {
    return Campaign(); // eslint-disable-line
  },

  sendChat: function sendChat(sendAs, message, callback, options) {
    return sendChat(sendAs, message, callback, options);
  },

  on: function on(event, callback) {
    return on(event, callback);
  },

  log: function log(msg) {
    return log(msg);
  },

  logWrap: 'roll20',
};
