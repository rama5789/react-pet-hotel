const models = require('../models');
const SequelizeFilter = require('../utils/sequelizeFilter');
const SequelizeAutocompleteFilter = require('../utils/sequelizeAutocompleteFilter');
const AbstractEntityRepository = require('./abstractEntityRepository');

class BookingRepository extends AbstractEntityRepository {
  constructor() {
    const modelName = 'booking';

    const inTableAttributes = [
      'id',
      'arrival',
      'departure',
      'clientNotes',
      'employeeNotes',
      'status',
      'cancellationNotes',
      'fee',
      'importHash',
      'updatedAt',
      'createdAt',
    ];

    const fileAttributes = ['photos', 'receipt'];

    const relationToOneAttributes = {
      owner: {
        model: models.user,
        as: 'owner',
      },
      pet: {
        model: models.pet,
        as: 'pet',
      },
    };

    const relationToManyAttributes = {};

    super(
      modelName,
      inTableAttributes,
      relationToOneAttributes,
      relationToManyAttributes,
      fileAttributes,
    );
  }

  async findAndCountAll(
    {
      requestedAttributes,
      filter,
      limit,
      offset,
      orderBy,
    } = {
      requestedAttributes: null,
      filter: null,
      limit: 0,
      offset: 0,
      orderBy: null,
    },
    options,
  ) {
    let sequelizeFilter = new SequelizeFilter(
      models.Sequelize,
    );

    if (filter) {
      if (filter.id) {
        sequelizeFilter.appendId('id', filter.id);
      }

      if (filter.owner) {
        sequelizeFilter.appendId('ownerId', filter.owner);
      }

      if (filter.pet) {
        sequelizeFilter.appendId('petId', filter.pet);
      }

      if (filter.arrivalRange) {
        sequelizeFilter.appendRange(
          'arrival',
          filter.arrivalRange,
        );
      }

      if (filter.departureRange) {
        sequelizeFilter.appendRange(
          'departure',
          filter.departureRange,
        );
      }

      if (filter.status) {
        sequelizeFilter.appendEqual(
          'status',
          filter.status,
        );
      }

      if (filter.feeRange) {
        sequelizeFilter.appendRange('fee', filter.feeRange);
      }

      if (filter.createdAtRange) {
        sequelizeFilter.appendRange(
          'createdAt',
          filter.createdAtRange,
        );
      }
    }

    return super.findAndCountAllGeneric(
      {
        requestedAttributes,
        sequelizeFilter,
        limit,
        offset,
        orderBy,
      },
      options,
    );
  }

  async findAllAutocomplete(filter, limit) {
    const sequelizeFilter = new SequelizeAutocompleteFilter(
      models.Sequelize,
    );

    if (filter && filter.query) {
      sequelizeFilter.appendId('id', filter.query);
    }

    let where = sequelizeFilter.getWhere();

    if (filter && filter.owner) {
      where = {
        ...where,
        [models.Sequelize.Op.and]: {
          ownerId: filter.owner,
        },
      };
    }

    const records = await models[this.modelName].findAll({
      attributes: ['id'],
      where,
      limit: limit || undefined,
      orderBy: [['id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.id,
    }));
  }
}

module.exports = BookingRepository;
