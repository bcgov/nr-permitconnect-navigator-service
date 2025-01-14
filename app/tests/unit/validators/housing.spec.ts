import { BasicResponse } from '../../../src/utils/enums/application.ts';
import { NumResidentialUnits } from '../../../src/utils/enums/housing.ts';
import { housing } from '../../../src/validators/housing.ts';

describe('housingSchema', () => {
  it('should validate the housing schema with valid data', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      otherSelected: true,
      otherUnits: NumResidentialUnits.ONE_TO_NINE,
      otherUnitsDescription: 'test description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeUndefined();
  });

  it('should not validate the housing schema with invalid data', () => {
    const data = {
      financiallySupportedBC: 'Invalid',
      financiallySupportedIndigenous: BasicResponse.YES,
      financiallySupportedNonProfit: BasicResponse.NO,
      financiallySupportedHousingCoop: BasicResponse.UNSURE,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: '',
      indigenousDescription: 'Indigenous Description',
      multiFamilySelected: true,
      multiFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
      nonProfitDescription: '',
      otherSelected: false,
      otherUnits: '',
      otherUnitsDescription: '',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE,
      singleFamilySelected: false,
      singleFamilyUnits: ''
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should not accept empty object', () => {
    const data = {};

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should not exceed maximum length', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'a'.repeat(256),
      otherSelected: true,
      otherUnits: NumResidentialUnits.ONE_TO_NINE,
      otherUnitsDescription: 'a'.repeat(256),
      projectName: 'a'.repeat(256),
      projectDescription: 'a'.repeat(256),
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should accept when singleFamilySelected and otherSelected are true', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      singleFamilySelected: true,
      singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
      otherSelected: true,
      otherUnits: NumResidentialUnits.ONE_TO_NINE,
      otherUnitsDescription: 'test description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeUndefined();
  });

  it('should only accept otherUnitsDescription when otherSelected is true', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      otherSelected: false,
      otherUnits: NumResidentialUnits.ONE_TO_NINE,
      otherUnitsDescription: 'test description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should not accept otherUnitsDescription when otherSelected is null', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      otherUnits: NumResidentialUnits.ONE_TO_NINE,
      otherUnitsDescription: 'test description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should only accept a certain set of values for otherUnits', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      otherSelected: true,
      otherUnits: 'not-a-valid-value',
      otherUnitsDescription: 'test description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });

  it('should not accept when none of singleFamilySelected, otherSelected, multiFamilySelected are selected', () => {
    const data = {
      financiallySupportedBC: BasicResponse.YES,
      financiallySupportedIndigenous: BasicResponse.NO,
      financiallySupportedNonProfit: BasicResponse.UNSURE,
      financiallySupportedHousingCoop: BasicResponse.YES,
      hasRentalUnits: BasicResponse.YES,
      housingCoopDescription: 'Housing Coop Description',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      rentalUnits: NumResidentialUnits.ONE_TO_NINE
    };

    const { error } = housing.validate(data);
    expect(error).toBeDefined();
  });
});
