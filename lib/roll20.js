/* globals state, createObj, findObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx,
 spawnFxBetweenPoints, filterObjs, randomInteger, setDefaultTokenForCharacter, onSheetWorkerCompleted */
'use strict';
const _ = require('underscore');

const CLEAR_IMG = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';

// noinspection JSUnusedLocalSymbols
module.exports = class Roll20 {

  getState(module) {
    if (!state[module]) {
      state[module] = {};
    }
    return state[module];
  }

  createObj(type, attributes) {
    if (type === 'character' && !attributes.avatar) {
      attributes.avatar = CLEAR_IMG;
    }
    return createObj(type, attributes);
  }

  findObjs(attributes, options) {
    return findObjs(attributes, options);
  }

  filterObjs(attributes) {
    return filterObjs(attributes);
  }

  getObj(type, id) {
    return getObj(type, id);
  }

  getOrCreateObj(type, attributes, findOptions) {
    const newAttributes = _.extend(_.clone(attributes), { type });
    const existing = this.findObjs(newAttributes, findOptions);
    switch (existing.length) {
      case 0:
        return this.createObj(type, newAttributes);
      case 1:
        return existing[0];
      default:
        throw new Error(`Asked for a single ${type} but more than 1 was found matching attributes: ` +
          `${JSON.stringify(attributes)}. Found attributes: ${JSON.stringify(existing)}`);
    }
  }

  getAttrByName(characterId, attrName, valueType, dontDefaultOrExpand) {
    if (dontDefaultOrExpand) {
      const attrs = this.findObjs({ type: 'attribute', name: attrName, characterid: characterId });
      switch (attrs.length) {
        case 0:
          return null;
        case 1:
          return attrs[0].get(valueType || 'current');
        default:
          throw new Error(`Asked for a single attribute ${attrName} for character ${characterId} but more than 1 was ` +
            `found matching attributes: ${JSON.stringify(attrs)}`);
      }
    }
    return getAttrByName(characterId, attrName, valueType);
  }

  checkCharacterFlag(characterId, flag) {
    const value = this.getAttrByName(characterId, flag);
    switch (typeof value) {
      case 'boolean':
        return value;
      case 'number':
        return !!value;
      default:
        return value === '1' || value === 'on';
    }
  }

  getAttrObjectByName(characterId, attrName) {
    const attr = this.findObjs({ type: 'attribute', characterid: characterId, name: attrName },
      { caseInsensitive: true });
    return attr && attr.length > 0 ? attr[0] : null;
  }

  getOrCreateAttr(characterId, attrName) {
    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName }, { caseInsensitive: true });
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

  onSheetWorkerCompleted(cb) {
    onSheetWorkerCompleted(cb);
  }

  setAttrWithWorker(characterId, attrName, attrValue, cb) {
    const attr = this.getOrCreateAttr(characterId, attrName);
    if (cb) {
      onSheetWorkerCompleted(cb);
    }
    attr.setWithWorker({ current: attrValue });
  }

  createAttrWithWorker(characterId, attrName, attrValue, cb) {
    const attr = this.createObj('attribute', { characterid: characterId, name: attrName });
    if (cb) {
      onSheetWorkerCompleted(cb);
    }
    attr.setWithWorker({ current: attrValue });
  }
};

