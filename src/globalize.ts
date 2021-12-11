// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import path from 'path';
import SG from 'strong-globalize';

SG.SetRootDir(path.join(__dirname, '..'), {autonomousMsgLoading: 'all'});
export = new SG();
