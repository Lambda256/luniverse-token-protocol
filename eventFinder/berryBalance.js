const fs = require('fs');
const converter = require('json-2-csv');
const txFinder = require('./transactionFinder');

const CURRENT_TIME = new Date();
const FILENAME = `BerryAddrBalance_${CURRENT_TIME.getFullYear()}${CURRENT_TIME.getMonth() + 1}${CURRENT_TIME.getDate()}${CURRENT_TIME.getHours()}${CURRENT_TIME.getMinutes()}.csv`;

const BERRY_CHAIN_ID = '8555924898017198221';
const mainContractAddress = '0x5845D58ffD0b99D17eAa1DdE6B38bAf98a420982';
const sideContractAddress = '0x05f2a13586B1AE81DAe07E451a0034E8ef1CB0ED';
const swapAdresses = [
  '0xe702c1cadd421b3193a035716eae2c60e8f21f45',
  '0x9e9f74aa5b6bc95cccba87c27624f2e75178cfe3',
  '0xa3e458fdd355d9f940cb202ea71b8bc1537e305f',
  '0xd376f432c741dcf00c0098de7b643dced4cd41c3',
  '0x75310a536983ac69d13d63da23f56571b3f27fb5',
  '0xadc88dba10b5abd08bc906541df2ff367941e6a1',
  '0xe59d899076ac443b94600fedf5f72d2f91faba18',
  '0x7e2a9981ea484dd52311b6ed091322f287bf1ee3',
  '0xb3f30d8f3c8f207342b0fff6fb1171f4e68d8d8d',
  '0x4a8d9efa6e942af616ce052c0f862014c5e17c84',
  '0x0e8d20eb4c0776b2ebb7e9fe8f0ad728bd239985',
  '0xb49b1a5b4f10a1f61c5b62a4093fb84c3d984056',
  '0xf51911129a1ff4ae9e959bf60bf0abd427efbff0',
  '0xdb244d9cbb27d74fe22a99ba4d17e18c809cde11',
  '0x5dede82358c5b115558b9cf7e36fbf2083174079',
  '0x2f8fd4d28f18ba57991df77fe85e10e62cba6ca2',
  '0xeb0b6ae1d46f245da302ecb306bf504e9f832531',
  '0x0e672eb174ff7a02c50aa0603728aa99352f21d0',
  '0x071833289cc07ed8cad11d5bae4f3b322ef5a0c0',
  '0x7c9fa327afd6f5b81b046a9350b1afaffb067735',
  '0x210552f2948ebb21d7ffc26685e25eb1a7265bcb',
  '0xefa166daea13577fe91ba7613aec21bfb30789d6',
  '0x676ca1db85125df468345cbbcdb00a51a5354d27',
  '0x1da80c68b11c440d26c6c62a688a341ead97b1e3',
  '0x490ef199d0d80ae1a04b67c3dfba18d9f4462acd',
  '0xcfd0bf016c2b9ecf1b6954a673c646de952cde73',
  '0xe30afd0895186382ce2b0a27e919078768945bba',
  '0xa1a15e0357d6b74d53d148030b8f96d1588338f9',
  '0x19d41b527341785dfcd07f89f9eac29f3067516f',
  '0x42e1293e2625975b72f0e965fa482533ea3182cb',
  '0x592170c469717b0e28bc032ab99d5ad1f7de9063',
  '0xefd40e3847ea277df1bee662cbcadfe90f8d3b8e',
  '0x803ff3d2bc7f4322e2f147b81dc3bcee211e5a54',
  '0x493f554f6bac02329d9f9701392df17d3156b784',
  '0x28f0fd349598baf127af57d390a1adf5ddff155e',
  '0x0139876a621319006964bf42accf29600dec8d8f',
  '0x4a55d5c1e40d78cabf3906c03c63cb81bb4cae40',
  '0x27528db214e34345dd8866ceda5ba2e60c6a9732',
  '0xecd704566049b885b33d7135a5bc0f7d385936bc',
  '0x0c6de1c6f88da943cba51826ca29cffc63ff9f72',
  '0xce923a3943452c3d0e471cc106df24610536b879',
  '0x0b27d563b42d9686d1b51eed4ba10a0a95bcfc72',
  '0x2c6b449ca690dec4cd02519b096fdff948b62cfa',
  '0x3a0a8e63533087fe36571203365c01cc12c251e2',
  '0xfb4459bf595e0b5c080540f6c9bb3152686be7ef',
  '0x347e1668a1ddbb61cec35fdca1a479d9f624131e',
  '0x094ca0b097ceb21454a7ce589fe66a337dc4e18e',
  '0xd7f91f9c3c274838cc0ac906ab0e1a823622ee14',
  '0x6b6d330d0f6d9af860b9385160c53df4ddbbb64a',
  '0x5000b90d7cc21c47fd03d2fe05a5f89311ba6b6b',
  '0xdfd09e7e3db749cee0ac579b16e491e618593657',
  '0x75fb3b7f65db8c16094be55e8c89fb75e6a9c5f2',
  '0x22762935ec61c7e0432f4a756f8ee9cede21f960',
  '0xe9f5be050cfc1d5e6af14742818243d008f972f3',
  '0x6b04d9789c41047c0e409a81b9098e45ab16c088',
  '0x9e9c5eacd1d8d891dca759838be3092c3eced3fb',
  '0x0239236302ab785873ee372f817e14c18b782720',
  '0x39e77bc1fcea7b5a988a81015d2db85c9406ae1e',
  '0x519df8108ef315a4431d2de0ab0e61d288c60ec1',
  '0xb2b6b135f291b292d8c0d3bfe1dd014a8f46de4d',
  '0x7fb874d09c81c910cc87a27c7a91015131d4dd67',
  '0x2d5699f381c000dae515901fdd5927648b13ffd7',
  '0x00f487aa6619e7b7167044b32c713c364b115d0a',
  '0x48a418ce1a0c79139e8848d055e8e0b756eddaed',
  '0xb8bc7f0e10be265de935379713e974da0bfc44e5',
  '0xe76bf0394827cbaf92d5a068d0976e38529e913e',
  '0x50855930cc293ba48845de8ca0dafac56cda6519',
  '0xeeb96407ce953e05b1c009a5a4ff470d0a191718',
  '0xc740881e94b50f6acf7a0d1be4a8b4d330564f2b',
  '0xb24ffe398c530bbe095096d828b04c50b2fe2da8',
  '0x0bca48c4d25c5a4da0dba32c11cbfd3c66a25d47',
  '0x86c85cb032ad69ccb4ff3f1630fe5ec7fa2c4eb3',
  '0xc89da682f50f4b7c89adecabebb5f247cc1c60c6',
  '0x6c1edd6762e9b40498b1c6b8e4b28af9a03fdd88',
  '0x5b4f98a4d6117bfe73801c63803db1efc28355b9',
  '0xd6464e367d2d138edf28f59a1c8c88ee528c1989',
  '0x6f95e00ac05d125b5e0fc744d12599e111be8a1e',
  '0x4a90a328b9534ab177bc181191020730b0930f5c',
  '0x5eedf36398eea272e4d7da84bd7b85292e0efd71',
  '0x03ccb16d6eb3cea88f104dc2a8ceb1aee35e08ca',
  '0xd0e5d9ec0081519a5fd7e198f6f18bfb0b3e486b',
  '0x34123d436fa72035958d7a1ad6552864baae298e',
  '0x66f3739c134d70b4d5e3609ec0e120f83b7e049f',
  '0x45528c71bdadc96cc30116747d6f25a6590cfcc1',
  '0x75c81f75b65c8340c9192087f8418c464136cfed',
  '0x0342c9440d6d8d1fc22cf91f55ece736fd57b6de',
  '0xb07006b496212cdacfc0dbb7d7ca8f3e680051b3',
  '0x3ee4ebae86d1adc20b7c730c84e0585815fe7e65',
  '0x74fb48f80378da6ad735e702c69c71d3df39e3c0',
  '0x5ba357095dcd1d1ba0b1ee2a9147477682afa7d5',
  '0xd796e4331fda5d8bb2246705bb10fb5b32140c60',
  '0xdfa7467de7920ba8cae77de03288eb0c0b84e892',
  '0xa0df91a3b776ff676eeecdee09610181d081df31',
  '0xea8771cbeaacca34afc81415dfa8468e5fd9f288',
  '0xa8cd86d744b867b13a724ddb964e12f41a5b1658',
  '0xebf05451622ee2db1b8e17671dc28a845b7b0468',
  '0x9c33edfdc0cada35472afa6d0d73bdfa93d2d951',
  '0x4dcb297e428c3844776b8862916123f17a909543',
  '0x60069ccb932748be19a0e0df7f239fafff98c098',
  '0x0b2e1064dd7bb77a46d2cf87d719083df2b0839c',
  '0x5812439aa1a092d7199e20c5db9a52da6740bd77',
  '0x2fb74ab6067adc22f0073d7e66c2f08e5f70047e',
  '0xf1f6a4cafbd99f1a8b476774677075e6529027dd',
  '0xace413579c09bbe21905ed5f8d579a855070c3fa',
  '0x3f4e335abc9b00ed7e03eaf9b66c023b6b4ab3a1',
  '0x1241b2bfc0c4c50d7dae98732d8d7f1dfa5b0e8a',
  '0xad72dbe9e7e2bd5e43967f44c3c270a5211b3606',
  '0xa5d6f4372d6525f967d2e5def93387297bd45016',
  '0xb57160df2ad9e5c78ecb1a5264f650efd5041550',
  '0x6d324e34585898afce0ab0c02ee06a399e6cc689',
  '0xf6f6d5714d45c621a724e85f15907eb175d9bcef',
  '0xf8725229bf4f96cef7b3dda29f638d117babe74a',
  '0xca94bde0684b11c04b9a122ae7c135495263119a',
  '0x17271548cf3b646d82122aa31874e53b7886cbbf',
  '0x826c1080255a8d45cd0e41606ee9650a1090dfae',
  '0x4c2583871e7db6028495fea2c10ca242489577cf',
  '0x2cc7659936264497f932e0c3514fdd0eb1e5f96b',
  '0xbd11bf4fbc012e27f108d01655294472ed819a69',
  '0xd08d55bfdec42404a38048e5794ed92129235ceb',
  '0x89b903012e6731dde71b8ca22026923934b1ea28',
  '0xae2c2c116d43014822f1140cf66af42ec1031606',
  '0x7921966e571ddd29b06414149250a28dad706100',
  '0x1ae4c8a446b356c7c373ea50bbb35dad48fb674d',
  '0xbaf2e51d8342a8b3c034147003d8d3e425a295dd',
  '0x8ead6faa7240374449df0baa960ca1ea4e29e73a',
  '0x6156fb8496b6394013e520f385c5914ed256c4e8',
  '0x8ea6ac1ce74aa9e5a31bbdbe22d9e9163897a375',
  '0xa6bf7c6ea3ed4d26704356c520a3214bc9e52f68',
  '0x3e5a2988051d37702c8507c4ffffd31dff29d78c',
  '0x2b967e8cc66cf0e890f696b85954be2dc322f7b6',
  '0x25753d28f9641982cbae0467862a186e0c6e2aa5',
  '0x61089e7ab2892a89948d5229b5ca12150a092cb5',
  '0x8171b0cea296b8b39e93def29c06154e4b22bcb4',
  '0x938cb25b17efbabe5969bcc3cbdeab72b834e61b',
  '0xf8c2852f6058f2a143b20d99e792af4c0327e50e',
  '0x56c7d476cd6983afe6200b5a8d73ceabbfa499e2',
  '0x7fb6de11f6b2d0582c8e70857a94f3765259d854',
  '0xed9b18a6abad4e3c487c66ac9ff88091c860ddb9',
  '0x550832da30528c9bf86dc313e793854f42fe0f44',
  '0x2f92554bedc7d47994c950cb1dcf82dd2267af8b',
  '0xd77b5689f208f6e01147c4ff46859545a5acab90',
  '0x3a8cf56728577df2e9b17242c759660bc82c9aee',
  '0x6263fa039d901d0025b1ad5dd6f5f52fa79617d8',
  '0x76ea178c371e96acc3409eee2cb6dfd82dbfee72',
  '0x140a84a73d4e004fbe930f7e13aa7b428ae119f4',
  '0x415fa58b35d4f744cc8a36cf81d1c46f409d1b95',
  '0x2a190e6284da756a9c244e6958cc8a1062e5b6d3',
  '0x9e316e22122bfb8def46990d5429df8abe06cb1a',
  '0x43a2df8a794ee6a4db2468437b9769f1ec192ddb',
  '0x388dfa15e43e7b9696685fe718e5f015702a0088',
  '0x7910bf7172a18d20ef0f0be69adfdde764b6f00d',
  '0x8287504359ca1d2cd1449ade92ed59f9e59f85e8',
  '0xb4c2fe2cfd21e435c10f2c8c1ada3386f1d986e8',
  '0x220f5b2a0570501be5b0bfa2d1cf0717769302c2',
  '0x0362682863834dddcefa3aa1903d2776d9eec289',
  '0x999ba7be6226be24a8a6060e5322057213142956',
  '0x92bc26aa3d7102dba8d1e47946aa9a05e33c80be',
  '0xcd2d4166ce79973ac0ae7f6e36193360b488ca87',
  '0x660f02f6caacc6e55d72349f3a7987f6c152ff6a',
  '0xe176cde424fb75cafd6e34b4e9b0756cccc8ffb6',
  '0x6dfb0858c1fcca8ef0bfb473aec43f34b2c0e97d',
  '0xc7872adbbb6841b1279ffd9a70ddd34f75aaff3f',
  '0xfe31a0dd7e650ba24e79e3b6822b2aee8ee2e39a',
  '0xb56352bc2f0d98433cdbe382b38af1e88c692583',
  '0x38aa1e447f128c802a96fe1b0dfbeeee36b2852f',
  '0x08da31d9f92301734bdfb13f9aa1d64540ad3858',
  '0x856cfccf8f42524d0795aa2f629cc2ab696f8972',
  '0x93343aaea26e718e37f82f47161d1ac411d0446f',
  '0x23656e7c7dfd868c694a6a726c8317215e4add9a',
  '0xf2143afe5a6ade3d825697ff263bb072f81db171',
  '0x3ff714d9fb7339a115985bc1ff8775e065c60ff8',
  '0x0fb4c27d41dd6572c3aa3d86fa5157737edd346d',
  '0x2f79287432a09f26b437a02736817d16496c0c22',
  '0x65b07064b57dc3399afc57964062f407e9d15941',
  '0x0e0361773fa92ef5586f2161a39fc5b550ddf59f',
  '0x3b1fc644942c7ef12a4ff57938a9962476c75394',
  '0x959ee5e720829a0c22fbd1a4876e90b29623519b',
  '0xefa3029d568ac91e77411ac3af5019e20c924913',
  '0xf1a33940ef27df91ee4bc2dc93285fb9147cf79b',
  '0x7a36cf04a4606b518aed5736b93d104d01b1dbaf',
  '0x897ea272ff19325b950cd0ffa7e405786511b40a',
  '0xdaf86db6669e43430d2d6d11c6298ecc18ef5163',
  '0x151f7cb6289bbf0d3ffd379bb54e0d6477264758',
  '0xa789a8ddc99ae1ee630efa921797c7dc3a677922',
  '0x60610df0e8a7987560c65dc5fba36c116deab806',
  '0x8ee93096459cd5635229e00f0126defca2f8b061',
  '0xb94fc6dcd0d3d7108f0bd48d3aa62774fd3e0482'];

const userAdresses = ['0x009bcd29e03627474831c9800f5c32cd9c19d92b',
  '0x0238375f76fe62722331a3171d53e8a861400529',
  '0x041c1534aef625055413821258d36c7c03fad1ea',
  '0x0489d6ee0d0b16454e0ceaae5c7ad915e37cbe8d',
  '0x098a49565c3430b45dfc7c9638bfd126b5c26616',
  '0x0d436b01372a28e717c0a5b0522dc4b4c4082a0b',
  '0x0eaf6303bd206c0322fd324a7167afa0013d1122',
  '0x11504840492f51c62c5bbe596660acede032c623',
  '0x1288c3223a2ded0d3282013547d1b79701eb9f2d',
  '0x1334e596ba948779635091fe4d0d546f905997c9',
  '0x183d897e8fd9d8b42c4f164631fbf0f0add8a061',
  '0x194ba3683998dc978652f58e2c4726568af7457a',
  '0x1a39145826ed6f09264094638c6bef5823590d7b',
  '0x1ab0587816899201e1b48c1662345b76f8d7d376',
  '0x1b1b174786967052c2fcdd8d4c40e04f3e14fcde',
  '0x1b866b05ee6e66512241ccb7804e00cb6e074bac',
  '0x1da593089e249bb5fe58b1999065e52e9d1fc173',
  '0x218bbbe13306f0223ef086984892a95e568a1b60',
  '0x221c67efa6b1f525ef1d603b550da5afe2c1175f',
  '0x24db3f28a345fdf9cb85fb785d6e35ff1eb83211',
  '0x27c7e8c99c42cad3e78f38387e9fcf8663b6668c',
  '0x2820cfdae029868ff0853b79e9ca4691a377e8b7',
  '0x29addd8b20527aef811226d2ab7f2d30de0e912a',
  '0x2a52ecf114bfd2c390fdf05805cb5ed712f71309',
  '0x2ad3f86e0921b02d59bf142234ea4622af754c26',
  '0x2b658a6591d1a98970c033ecd0798afd9c92a5be',
  '0x2ebdf7225415d7bc080553aea061de4ec6da6982',
  '0x2f3c5f13948e5daca6f021953dd29056336f27cb',
  '0x30f4cf04ef1798e0aaf3334a138a426d8389ba0e',
  '0x313a5be85afa9f627412d86b05e2eefd8a6f4240',
  '0x313d80a6665dc9b9dfd50a49cd5189af463c187b',
  '0x326d23f14c00eae1866271a4def6d548ef87487f',
  '0x33f7aea5868777b13bd363bd52f2acc51a268168',
  '0x34d40b366498f8a7acfe2f59c95224485d79c176',
  '0x3a608825437cb76b213be6db558d4209832193b3',
  '0x3cc8f9708206495e48b547d8bbed58f75725f317',
  '0x3f151968486c597df19de0c1c876f3489ac37b04',
  '0x3fd84cc0babd71c83aa197c16f27a80c42f813ad',
  '0x40088e3f389b1737a719947ff9b4efd4a3bf284a',
  '0x407e03a5178216fc12a12e6e65aa1ca5ebd3b8ab',
  '0x44efc4c255955e9ba2aa1e8f2a90cfa555fe4e04',
  '0x4508cae24d7a338f9889ec69b59ababc50eb2e4d',
  '0x464798c6e8a7fb2a3751de52c22f17a81fc5d876',
  '0x474f5fd27c69b2df2873d243862004fecd0ba99e',
  '0x47dd2df9c6a896ba5c804015d5ba55f83fbb9d93',
  '0x4911ef3c76906651e861ad7e47899b2559f6a69b',
  '0x4a156906782e232cb614b4401c77100b8b1094fc',
  '0x4bd61f04bc35aa8c0e7f4544c51c03e2260f5784',
  '0x4e0f3b2e4171e0c76e4e9a7b854e06a701980412',
  '0x4f7e48e5028eaa131ecc4e548d7bff852c918857',
  '0x50793c8eeb05d16320ca106bfab967cd34c4256d',
  '0x53d9ee888a71b2c8c8e2a5a73739d48da8324c0d',
  '0x5944e63f19b243b2c4b1e0fe9bbacada4da481a6',
  '0x5a687f17a5022549c4672de1671bdaaaaeaab4ef',
  '0x5b9bbafe3b710810efbe6b6691bb5b8ad26b0d56',
  '0x5cc5cc21fc998d0f0482216216ec899788f94fa1',
  '0x5ebdc178223f56a73380beb7a6d4c0c772eb3537',
  '0x5f272848fd6b6caa7c81c73e3a1e7d93b2f202e5',
  '0x619e3b135872dfcc2158389eaedaf6c6a9a5f7c4',
  '0x62d857cae297156839a37958af2b0bd8e65d574a',
  '0x63651ed480eb2ee1b92a5ece5c138027e16ca412',
  '0x63a58d970a6339455833e73dc01f50373608c7b9',
  '0x67b15c98ed356febe903af2b5095a5d837ebc219',
  '0x6982ec2b8f85385f68a0d2cc89b9cf10885cc8b3',
  '0x699fbec2998d96d0c0c18acd3f5bf1de345e3ca5',
  '0x6a2539c8c15872e6b7460ddc7ada21e6ca9acef1',
  '0x6a376a66741038855d7e5287389ca4ab3d3763b0',
  '0x6b005b418b5c6b7a1429556cb2ffbb4509c2f832',
  '0x6c55a7acd5ac79036b16b2736d7e2c74dcc6104c',
  '0x6cf5c0bad6eea13efa14a0c47af84ca029913b54',
  '0x6fa2b72ef422e8d4f2bb80881a204efec7bfae99',
  '0x700befe1abc0d3534e1ce0f973d66a0eea7cf7f1',
  '0x70a9e45323209202e773b2a9d173abb79925ddbe',
  '0x713337f2f2f4e3d340cc836c03a647c72062ab02',
  '0x73a2cb31046a75f459a154a3d04e1cab061c1094',
  '0x742f37009dc774c05b661369bf41cd109b676bc5',
  '0x75564f12d68343a31582aa1867d26c9021e94cf3',
  '0x75a4cff6ccfd60bc8202501b5ca24c2a84bc5f08',
  '0x76f5b298c93bac5a2ddd8e157f294a94b7a6210f',
  '0x77fbb2493dac89f41d853db6e910eed70885647b',
  '0x785d1209af6f328a20abf851408a0d8a370d3985',
  '0x7a6dd31ccceceef79a40f2b28408b449ba6ba0f8',
  '0x7c136033848fdd0a7a0768c495f95a83206a25c0',
  '0x7cb16a72087e591667556eed156d91289ca283fd',
  '0x7ea4fd670d39c08795a874313a9a7b4fc712bba1',
  '0x7ee9310b71eff778ec75aefc1887d81d8a0bf226',
  '0x807815363d8c3f5698f0879dff07dbc83065cfc0',
  '0x823eb470c837aca8369ba23174a45d1d7e882711',
  '0x83d34f12161eb35cd0e172fd2f5184018ff647cc',
  '0x86b6df09dac926e1297f145b26434238b5450244',
  '0x87e17b8f8688e5ce8f6a0157a50133c185850533',
  '0x89c809ea30568498316ac33314b90a8e195d6f21',
  '0x8a59e603ced9abd1ae29341b8670b1db5aa59c8d',
  '0x8c015ce5e40ae8e209cc7db2df99c7f0fd2a06fd',
  '0x8cd468e3149f8eb3336b1c56fef318248ee052db',
  '0x8df8c6f97b106de6d66660b98447415a104ed89a',
  '0x8e86c11175a6418d936e6e89d48070b4bc52f320',
  '0x8ee85fb260009dd3a410ba81cd329e518e08a28e',
  '0x9345bd5089a7a814d50c6cc1aa2ea4691b3d6646',
  '0x941fa56aa59fcc28c335caddbebde3e78829541c',
  '0x9528fd71208551b56ed62f181382801bbb40ce69',
  '0x955db6f690a4133a4c78f4406b09b0aee03fee2c',
  '0x95ed262ca35b6279364520f820aaab9bdc7d0b2c',
  '0x97bfb3f4a31c12e058722950cf05a4344072d97b',
  '0x9a12e73942ee000360c6b187ca99c97086d5c4ee',
  '0x9a782c9496436d48c5a243cad5784dbf7defc9ce',
  '0x9dcd23eff95cf0f59917e7ff893490fb2bd636d1',
  '0x9ef55f6e30b0aaafb5e7075a845bfd66f6e909cd',
  '0x9f788e424d8ff9f1b41ac2f1597e7a8943d244a3',
  '0xa00fd305633b55c0c0bd32c8755d7cf331c895e4',
  '0xa01d36743f9da3b723da9bab5bf15c0b984f42b4',
  '0xa3610b1c8b46a323ffe8886f0949ec405d050e25',
  '0xa5e6bd66cae462059e06d95b944b190bd43555f2',
  '0xa766e01b54472926998aaf3f688ef3e1d873809c',
  '0xa95d798687310c846cb23eaf503b7a8d5d9c57b1',
  '0xae49ee07b23dbbbb77f6df40dad6fbd041e78f8a',
  '0xb0b7803b311ce043a6784b1e1130eb92fdb6a21c',
  '0xb27ed6b18436a7898dd427e61040844392b03881',
  '0xb37daa43da5ced1d2b617cfe6e853aa87bb21d8c',
  '0xb4122747ca08f1093464a39a699e68eae1f30038',
  '0xb47a2f349e8733112cc9aaad360450387306dc54',
  '0xb7484af4e79c6535d14fd91e05fd24aeac6d5add',
  '0xb7818c73d0b75982a95a622a88505d23fd7a07cd',
  '0xb948607a8b5f15f67e3fd8c764bbab9e233b6581',
  '0xbc5dc68af4b1d8a8f8dfa24171c758f2a4e112ed',
  '0xbe7c3a102064a7b46991d91480b140a91a8b190e',
  '0xc0029eef0e5353c4afff2cec3400e76ad9fc059f',
  '0xc1002719730e71bc4e488ab3f0b2e2cf96a36685',
  '0xc1080baad8969c5ac4b73c8a17153e3a58006dfe',
  '0xc12e6c916fa0cff26bd8389504edebd54e53a024',
  '0xc13f4da9a0bdc7f6b276374f03e178b764c23200',
  '0xc1ae3bb3afb1ef38ce201e10ce2542c016bc1809',
  '0xc1fa8ca66416dbcf7638e637b6bc960d4f595004',
  '0xc355e3925b9211316117db8425a441374d537821',
  '0xc81ddc5523b2677b3c7112c51fb7037a92c43db2',
  '0xc834347c0034f04dd8ba2543b9a474609d251474',
  '0xcb1d507af1f876ae56fd121d1366f68b4c3efb78',
  '0xcb52777306b4a2dda139295fe1b4a14506ec2243',
  '0xcd2fbfe98a623145cb12a1d4109362f5ffffc4e0',
  '0xcdbcd62d64bac61107fadc7017b1b2f35cc23cdf',
  '0xd02a6e4fc46d8d1d1fcbd0071acb1bae33833197',
  '0xd15431fb1a094ea06774f20956fbecf0dbb9d956',
  '0xd345c200ff49e01ad62d1b7a44bfe46b91e6155f',
  '0xd55d88b4ae8b03c71c5f28b270a88ac187fcddb3',
  '0xd5b13d3015387d622bab07efb5a7f7bea9596942',
  '0xd876dac39fc50c2743410579ad8665fd083a5947',
  '0xda5a792ad5962204a9dbb1c41db3c7d2a95d8005',
  '0xdbe8e3649cdafa4b7af482c3cb5d9bafb1500e8c',
  '0xdc57cb66a25586cce0f97fd33f8e3cc0093ac8ed',
  '0xdca5a1a66ed46dbc9cf7ff9d4bcef5389cec7d33',
  '0xde2962a1d5faf52678724a3bbf83f34fc5c57669',
  '0xdf7279ced18d11cc7be71bad98987eba36870686',
  '0xdfde736774e9876506232879e12a22d73c5f15ba',
  '0xe0d6fafaef3f1923f33f22d0548ec3a1c6697d08',
  '0xe3ad02d5d9be77d1fcb89bc7f1b6071586c011cb',
  '0xe3fb1b6a8e7fb937269c0cf4a65c717a8c3137ec',
  '0xe42bb846e4ff025ee50dc5cacd64f272a43f7acd',
  '0xe51881a16f35a83bd6aa9a6b0d0d872405075b98',
  '0xe60210f521365c3ce0fbbc3d2f8fee31979a9f16',
  '0xe632739a867f3c9cafe41ff292800e857871cd75',
  '0xe8ea3439fe0a7347f2027ed468111e4e58860164',
  '0xe9a6523cae98fe12d85548055645bed9554eaf5e',
  '0xe9b0ffd74748b7a84ad27471787429c1b655a538',
  '0xea3b077b9fdfac9e814fff23a3604ae10069f432',
  '0xea835b60535b7d27ff95a721477b66ba74b11e8b',
  '0xebb9972fad465e8bbab09542ac8f56d8621dbc9e',
  '0xec3ffa416ec64437c7b634cc4b37ec71b295ef96',
  '0xec7494a44e544b1de4527adc4bd6af7d91cfeace',
  '0xee70186d8a5f373dcde2c01d9f3e1f52a6966e2c',
  '0xf0678c2e46dd536246ead0efffdc6f375139e711',
  '0xf0e845cb2d711b26d64062aa159d771de4b0ff99',
  '0xf183def62ba028b3c20dff9f69a27f523f3456f6',
  '0xf21226c6140410fccd1b3cc10d0ae915aed88d4a',
  '0xf3a76bbcb1946d532d08fad8a4629c3c269c78cc',
  '0xf43947026597b7e431c30d599da22aeb2f151ac3',
  '0xf5556e2205937932aef09e998d6e518cccf72b28',
  '0xf79658e0ea067a555b87d6ad11074b3edff3121c',
  '0xf7bc874f02a21be97a2581ad78b6d7236454ca8f',
  '0xf84a1a1ff128d579706d97463560984f3d268eeb',
  '0xf84d2545903877ede8f1d0856bf55cac6a927b1e',
  '0xf865466c91d8ee9245a1a93bfab3dfcc991dc538',
  '0xfa3689bb9a73bae2aca4c85754a9b69e431fde1b',
  '0xfb65ab8ce5cfeb21a354795ad507d0a333c2eeac',
  '0xfc502b5c06ee369f47b8f729a175f63d94e785b4',
  '0xfec07c9a7bbfc0bb7c034eae96c540e554d675e9',
  '0xff18190edc983425c62cd277a73152eb9668215b',
  '0xff77bbf2ce37f51d022fd6b1f4a9b92c0127c386'];

async function main() {
  console.log(FILENAME);
  const output = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const swapAddr of swapAdresses) {
    let mainBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      mainBalance = await txFinder.getBalance(
        'http://main-rpc.luniverse.com:8545?key=luniverse',
        mainContractAddress,
        swapAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }

    let sideBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      sideBalance = await txFinder.getBalance(
        `http://baas-rpc.luniverse.io:8545?lChainId=${BERRY_CHAIN_ID}`,
        sideContractAddress,
        swapAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }
    output.push({
      type: 'swap',
      address: swapAddr,
      mainBalance,
      sideBalance,
    });
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const userAddr of userAdresses) {
    let mainBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      mainBalance = await txFinder.getBalance(
        'http://main-rpc.luniverse.com:8545?key=luniverse',
        mainContractAddress,
        userAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }

    let sideBalance = 0;
    try {
      // eslint-disable-next-line no-await-in-loop
      sideBalance = await txFinder.getBalance(
        `http://baas-rpc.luniverse.io:8545?lChainId=${BERRY_CHAIN_ID}`,
        sideContractAddress,
        userAddr.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
    }
    output.push({
      type: 'user',
      address: userAddr,
      mainBalance,
      sideBalance,
    });
  }
  const options = {
    keys: ['type', 'address', 'mainBalance', 'sideBalance'],
  };
  const csv = await converter.json2csvAsync(output, options);
  fs.writeFileSync(`${__dirname}/ouputs/${FILENAME}`, csv);
}

main()
  .then((result) => {
    if (result === 0) {
      // eslint-disable-next-line no-console
      console.log('[EXIT] SUCCESS');
    }

    process.exit(result);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[Error] ', error);
  });
