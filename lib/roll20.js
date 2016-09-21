/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
 spawnFxBetweenPoints, filterObjs, randomInteger, setDefaultTokenForCharacter */
'use strict';
const _ = require('underscore');

// noinspection JSUnusedLocalSymbols
module.exports = class Roll20Wrapper {

  getState(module) {
    if (!state[module]) {
      state[module] = {};
    }
    return state[module];
  }

  createObj(type, attributes) {
    return createObj(type, attributes);
  }

  findObjs(attributes) {
    return findObjs(attributes);
  }

  filterObjs(attributes) {
    return filterObjs(attributes);
  }

  getObj(type, id) {
    return getObj(type, id);
  }

  getOrCreateObj(type, attributes) {
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
  }

  getAttrByName(character, attrName, valueType) {
    return getAttrByName(character, attrName, valueType);
  }

  checkCharacterFlag(character, flag) {
    const value = this.getAttrByName(character, flag);
    switch (typeof value) {
      case 'boolean':
        return value;
      case 'number':
        return !!value;
      default:
        return value === '1' || value === 'on';
    }
  }

  getAttrObjectByName(character, attrName) {
    const attr = this.findObjs({ type: 'attribute', characterid: character, name: attrName });
    return attr && attr.length > 0 ? attr[0] : null;
  }

  getOrCreateAttr(characterId, attrName) {
    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName });
  }

  setAttrByName(characterId, attrName, value) {
    this.getOrCreateAttr(characterId, attrName).set('current', value);
  }

  processAttrValue(characterId, attrName, cb) {
    const attribute = this.getOrCreateAttr(characterId, attrName);
    const newVal = cb(attribute.get('current'));
    attribute.set('current', newVal);
    return newVal;
  }

  getRepeatingSectionAttrs(characterId, sectionName) {
    const prefix = `repeating_${sectionName}`;
    return _.filter(this.findObjs({ type: 'attribute', characterid: characterId }),
      attr => attr.get('name').indexOf(prefix) === 0);
  }

  getRepeatingSectionItemIdsByName(characterId, sectionName) {
    const re = new RegExp(`repeating_${sectionName}_([^_]+)_name$`);
    return _.reduce(this.getRepeatingSectionAttrs(characterId, sectionName),
      (lookup, attr) => {
        const match = attr.get('name').match(re);
        if (match) {
          lookup[attr.get('current').toLowerCase()] = match[1];
        }
        return lookup;
      }, {});
  }

  getCurrentPage(playerId) {
    let pageId;
    if (this.playerIsGM(playerId)) {
      pageId = this.getObj('player', playerId).get('lastpage');
    }
    else {
      pageId = this.getCampaign().get('playerspecificpages')[playerId] || this.getCampaign().get('playerpageid');
    }

    return pageId ? this.getObj('page', pageId) : null;
  }

  spawnFx(pointsArray, fxType, pageId) {
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
  }

  playerIsGM(playerId) {
    return playerIsGM(playerId);
  }

  getCampaign() {
    return Campaign(); // eslint-disable-line
  }

  sendChat(sendAs, message, callback, options) {
    return sendChat(sendAs, message, callback, options);
  }

  on(event, callback) {
    return on(event, callback);
  }

  randomInteger(max) {
    return randomInteger(max);
  }

  log(msg) {
    return log(msg);
  }

  setDefaultTokenForCharacter(character, token) {
    return setDefaultTokenForCharacter(character, token);
  }
};

