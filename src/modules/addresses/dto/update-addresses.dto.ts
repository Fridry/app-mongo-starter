import { PartialType } from '@nestjs/mapped-types';
import { AddressDto } from './addresses.dto';

export class UpdateAddressDto extends PartialType(AddressDto) {}
