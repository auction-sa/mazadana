// Policy Terms Page Management
// This file contains all JavaScript code related to the Terms and Conditions / Privacy Policy page
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let policyTermsRendered = false;
    let currentContentType = null; // 'terms' or 'privacy'

    /**
     * Get Terms and Conditions content
     * @returns {string} HTML content for terms and conditions
     */
    function getTermsAndConditionsContent() {
        return `
            <div class="policy-terms-content" id="terms-and-conditions-content">
                <p class="policy-intro">
                    مرحباً بك في منصة مزادنا للعقارات السعودية. يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام المنصة.
                </p>

                <section class="policy-section">
                    <h3 class="policy-section-title">مقدمة</h3>
                    <p class="policy-text">
                        الغرض من اتفاقية خصوصية الاستخدام، والشروط والاحكام، والسياسات وضعت لحماية وحفظ حقوق كل من شركة مباشر وعملاءها الذين يستخدمون الموقع سواء متصفحين أو مسجلين في المنصة، وعند قبولك والموافقة على اتفاقية استخدام المنصة فأنت تقر على جميع الأحكام والشروط الواردة في هذه (الاتفاقية). كما أنك تضمن حقك القانوني للدخول في هذه الاتفاقية واستخدام الموقع وفقاً لجميع الشروط والأحكام الواردة فيها.
                    </p>
                    <p class="policy-text">
                        تسعى شركة مباشر إلى خلق المصداقية في التعامل بين المعلنين والراغبين في الشراء حيث اتخذت عدت اعتبارات ومنها توفير المعلومات على موقعها بدقة متناهية وذلك بعدم السماح للمعلنين الا بعد التأكد من مصداقيتهم الكاملة وأهليتهم للبيع حسب ما تقره الهيئة العامة للعقار. إلا أنه قد ترد بعض الأخطاء من حين لآخر. ولا تتحمل شركة مباشر أي مسؤولية عن أي خطأ في المعلومات التي يتضمنها الموقع او التطبيق ، وتستقبل شركة مباشر جميع شكاويكم ومقترحاتكم وتعالجها بطريقة احترافية.
                    </p>
                    <p class="policy-text">
                        شركة مباشر هي شركة سعودية ١٠٠ ٪ ومقرها الرئيسي مدينة الرياض. ويشار إليها بهذه الاتفاقية باسم (شركة مباشر) أو (نحن) أو (لنا)، وتمثل هنا الطرف الأول.
                    </p>
                    <p class="policy-text">
                        "العميل" هو الفرد أو المؤسسة أو الشركة الذي يصل إلى الموقع ويستفيد من خدماته بشكل مباشر أو غير مباشر سواء كان ذلك بتسجيل أو من دون تسجيل وهو إما بائع أو مشتري أو مؤجِّر أو يرغب بالإيجار أو مكتب عقاري أو مسوِّق عقاري أو أي شخص يحمل رقم معلن من الهيئة العامة للعقار ويمثل هنا الطرف الثاني.
                    </p>
                    <p class="policy-text">
                        تخضع بنود وشروط وأحكام هذه الاتفاقية والمنازعات القانونية للقوانين والتشريعات والأنظمة المعمول بها في المملكة العربية السعودية.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">شروط الاستخدام</h3>
                    <p class="policy-text">
                        بصفتك "الطرف الثاني" في هذه الاتفاقية فإن دخولك للمنصة للاستفادة من خدمات الموقع يلزمك بما يلي:
                    </p>
                    <p class="policy-text">
                        1. عدم الإعلان أو تحميل محتوى أو عناصر غير ملائمة للتصنيفات المتاحة في الموقع والمسموح ببيعها
                        <br>
                        2. عدم الاختراق أو التحايل على قوانين وسياسة وأنظمة الموقع أو أي حقوق تتعلق بطرف ثالث.
                        <br>
                        3. عدم نسخ الإعلان من منصة مباشر وإعادة نشره في مواقع أخرى.
                        <br>
                        4. عدم استخدام أي وسيلة غير شرعية للوصول للإعلانات أو لبيانات المستخدمين الآخرين أو انتهاك لسياسة وحقوق شركة مباشر أو الوصول لمحتوى الموقع أو تجميع وتحصيل معلومات وبيانات تخص شركة مباشر أو عملاء الموقع والاستفادة منها بأي شكل من الأشكال أو إعادة نشرها.
                        <br>
                        5. عدم انتهاك القيود على الموقع أو التطبيق أو أي تجاوز أو تحايل لخرق التدابير الأخرى المستخدمة بهدف منع أو تقييد الوصول لهذا الموقع.
                        <br>
                        6. عدم استخدام خدماتنا إذا كنت غير مؤهل قانونيا لإتمام هذه الاتفاقية.
                        <br>
                        7. عدم القيام بتزوير أي ملف مرفق لمباشر.
                        <br>
                        8. عدم القيام بنسخ حق المعلن في أي إعلان تم اضافته.
                        <br>
                        9. عدم نقل حسابك أو نشاطك إلى مواقع أخرى بالوقت الذي هو يحمل شعار أو خدماتنا.
                        <br>
                        10. عدم انتهاك حقوق الطبع والنشر والعلامات التجارية، وبراءات الاختراع والدعاية وقواعد البيانات أو غيرها من حقوق الملكية أو الفكرية التي تنتمي لشركة مباشر أو مرخصة لشركة مباشر.
                        <br>
                        11. عدم انتهاك حقوق الآخرين الملكية أو الفكرية أو براءة الاختراع.
                        <br>
                        12. عدم جمع معلومات عن مستخدمي الموقع الآخرين لأغراض تجارية أو غيرها.
                        <br>
                        13. عدم الإقدام على أي ما من شأنه إلحاق الضرر بسمعة شركة مباشر.
                        <br>
                        14. عدم انتحال صفة شركة مباشر أو ممثل لها أو موظف فيها أو أي صفة توحي بأنك تابع للشركة ما لم يكون لديك أذن رسمي من الشركة.
                        <br>
                        15. عدم الحصول أو محاولة الحصول على دخول غير مصرح به للموقع أو أي حساب لعضو متواجد على الموقع، أو انتحال أي شخصية أو تحريف العضوية مع شخص آخر.
                        <br>
                        16. تقع على مسؤوليتك الشخصية التقيد بجميع شروطنا و أحكامنا الخاصة والتي تتضمن الدفع الكامل وفي الوقت المناسب لجميع المبالغ المستحقة مع الامتثال لجميع القواعد المتعلقة حول العمولة العربون.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">شروط الإعلان في منصة مباشر للعقارات :</h3>
                    <p class="policy-text">
                        • يجب أن يكون الإعلان لبيع أو تأجير أو تقبيل عقار فقط
                        <br>
                        • يلتزم المعلن بصحة كافة المعلومات المدخلة.
                        <br>
                        • يجب أن يكون الإعلان كامل التفاصيل وفي القسم الصحيح.
                        <br>
                        • يلتزم المعلن بأن تكون الصور المضافة في الإعلان لنفس العقار المعلن عنها.
                        <br>
                        • يلتزم المعلن بأن تكون الصور المضافة في الإعلان لنفس العقار المعلن عنها.
                        <br>
                        • يلتزم المعلن بعدم إرفاق صور نموذج أو صور رمزية.
                        <br>
                        • يلتزم المعلن بمتابعة إعلانه وتحديثه بشكل مستمر.
                        <br>
                        • يلتزم المعلن بالرد على عملائه سواء عبر الاتصال أو الرسائل.
                        <br>
                        • يلتزم المعلن بالرد على عملائه سواء عبر الاتصال أو الرسائل.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">سياسة الاسترجاع:</h3>
                    <p class="policy-text">
                        تنص شركة مباشر ان سياسة الاسترجاع تتضمن ما يلي:
                        <br>
                        البيع في منصة مباشر يتم عن طريق المزادات الزمنية الالكترونية والمنقولة نقل مباشر والظرف المغلق وبالتالي فإن الراغب في استخدام منصة مباشر سوف يقر بدخوله في المزادات والمزايدة على ما يرغب من عقارا بعد دفع تأمين دخول المزاد، وشركة مباشر لا تضمن استرجاع التامين بعد وصول المزايد إلى أعلى مزايدة وترسية البيع عليه بل على العكس من ذلك سوف تحمله رسوم إعادة نشر المزاد مرة أخرى.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">مسؤولية شركة مباشر</h3>
                    <p class="policy-text">
                        جميع المحتويات الموجودة على المنصة، بما في ذلك النصوص والصور والشعارات والتصاميم، محمية بحقوق الملكية الفكرية. لا يجوز لك نسخ أو توزيع أو تعديل أي من هذه المحتويات دون الحصول على إذن كتابي تم انشاء منصة مباشر لتكون شامله لجميع أنواع العقارات في جميع انحاء المملكة وتقدم منصة مباشر الخدمات العقارية المتنوعة وإمكانية البحث او الإعلان عن العقارات ويتيح التواصل مع المعلن مباشرة وان المعلن مسؤول عن صحة تفاصيل الإعلان بما في ذلك الأوراق المساندة التي تم ارفاقها والالتزام بالقوانين واللوائح المطبقة في الدولة بما يتعلق ببيع وتسويق العقارات وان الأهمية أن يفهم العميل ان كامل المسؤولية تقع على عاتق المعلن مباشرة.
                    </p>
                    <p class="policy-text">
                        شركة مباشر لا تقدم أي ضمانات ولا نتحمل أي مسؤولية في حالة عدم التزام المستخدم بسياسة استخدام الموقع ولا نتحمل المسؤولية عن أي مخاطرة أو أضرار أو تبعات أو خسائر تقع على البائع أو المشتري أو أي طرف آخر وعلى من لحق به الضرر إبلاغنا بذلك من خلال التواصل على الايميل التالي: info@mobasher.sa وشرح الضرر الواقع عليه وستقوم شركة مباشر باتخاذ الإجراء حسب نوع الواقعة دون أية مسؤولية
                    </p>
                    <p class="policy-text">
                        الإجراءات اللازم اتخاذها من قبل شركة مباشر عند تعرضك لضرر ما هي : (توثيق وأرشفة الشكاوى والوقائع المخالفة والاحتفاظ بها لتقديمها للجهات ذات العلاقة في حال لزم الأمر في المبادرة لتقديمها أو تم طلبها في أي وقت).
                    </p>
                    <p class="policy-text">
                        تسجيلك في منصة شركة مباشر يعني أنك تخولنا في حفظ بياناتك التي قمت بإدخالها بخوادم الشركة ولنا حق الاطلاع عليها ومراجعتها. كما أنك توافق على أحقيتنا في مراقبة جميع العمليات التي تقوم بها.
                    </p>
                </section>
            </div>
        `;
    }

    /**
     * Get Privacy Policy content
     * @returns {string} HTML content for privacy policy
     */
    function getPrivacyPolicyContent() {
        return `
            <div class="policy-terms-content" id="policy-and-privacy-content">
                <p class="policy-intro">
                    نحن في منصة مزادنا للعقارات السعودية نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.
                </p>

                <section class="policy-section">
                    <h3 class="policy-section-title">سياسة الخصوصية وسرية المعلومات</h3>
                    <p class="policy-text">
                        نقدر مخاوفكم واهتمامكم بشأن خصوصية بياناتكم على شبكة الإنترنت. لقد تم إعداد هذه السياسة لمساعدتكم في تفهم طبيعة البيانات التي نقوم بتجميعها منكم عند زيارتكم لموقعنا على شبكة الانترنت وكيفية تعاملنا مع هذه البيانات الشخصية.
                    </p>
                    <p class="policy-text">
                        لن يتم جمع أية معلومات خاصة بك دون سبب لذلك محدد مسبقاً. وسوف نقوم بجمع واستخدام المعلومات الشخصية فقط مع هدف تحقيق هذه الأسباب المحددة، أو لأية أغراض أخرى متوافقة، ولن يتم جمع أية معلومات أخرى دون أن نحصل على موافقة من الفرد أو المنظمات المعنية كما يقتضي القانون. سوف نحتفظ فقط المعلومات الشخصية طالما كان ذلك ضروريا لتحقيق هذه الأغراض. وسوف نقوم بجمع هذه المعلومات الشخصية عبر وسائل مشروعة فقط، وعند الحاجة فقط مع علم أو موافقة الشخص المعني.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">ما هي المعلومات التي نقوم بجمعها؟</h3>
                    <p class="policy-text">
                        • معلومات شخصية تتضمن بريدك الإلكتروني واسمك ورقم هاتفك نوع الجهاز عنوان بروتوكول شبكة الإنترنت (IP).
                        <br>
                        • الأوراق المساندة بما فيها الصك والأوراق الثبوتية لتصنيف الاعلان.
                        <br>
                        • معلومات الإعلانات، ومنها الموقع والصور تفاصيل الإعلان.
                        <br>
                        • معلومات أخرى، ومنها معلومات عن تصفحك للموقع أو التطبيق.
                        <br>
                        • بيانات الدفع.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">بماذا سيتم استخدام هذه المعلومات؟</h3>
                    <p class="policy-text">
                        • لمنحك تجربة خاصة وتقديم أفضل الخدمات (والعمل على تلبية احتياجاتك الفردية على أفضل وجه عبر تزويدنا بمعلوماتك الشخصية).
                        <br>
                        • لتطوير أداء استخدام الموقع: (نسعى دوماً لتحسين خدمات الموقع استناداً على المعلومات التي نستلمها منك).
                        <br>
                        • لتحسين خدمة العملاء (هذه المعلومات تساعدنا على الإجابة بشكل أفضل على طلباتك الموجهة لفريق خدمة العملاء ودعم احتياجاتهم وتحليل حركة البيانات على الموقع.
                        <br>
                        • المشاركة مع شركاء تابعين لجهات خارجية موثوقة على سبيل المثال (الجهات الحكومية , البنوك).
                        <br>
                        • نشارك المعلومات مع جهات تنفيذ القانون أو استجابةً للطلبات القانونية التي نتلقاه.
                        <br>
                        • التسجيل التلقائي لدخول البيانات.
                        <br>
                        • لعمل إحصائيات وأبحاث وتقارير عقارية ومعاملات الدفع في الخدمات المتوفرة على الموقع.
                        <br>
                        • الشركاء الذين يستخدمون خدمات التحليل التي نوفرها.
                    </p>
                    <p class="policy-text">
                        بالتأكيد، أنت المسؤول الوحيد عن سرية كلمة المرور الخاصة بك، ومعلومات حسابك الشخصي. لذا نرجو منك الحرص على الحفاظ على هذه المعلومات لاسيما عندما تكون متصلاً بالإنترنت.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">الملكية الفكرية</h3>
                    <p class="policy-text">
                        1. ما لم يذكر خلاف ذلك صراحة، فإن جميع محتويات المنصة تحمل حقوق التأليف والنشر، والعلامات التجارية، والمظهر التجاري و/أو الملكية الفكرية الأخرى التي نمتلكها، أو الخاضعة للرقابة أو المرخصة من قبلنا، أو إحدى الشركات التابعة لنا أو بواسطة أطراف ثالثة قامت بترخيص موادها لنا وهي محمية بموجب القوانين المعمول بها.
                        <br>
                        2. نحتفظ نحن، وموردونا والمرخصون لنا، بجميع حقوق الملكية الفكرية في كافة النصوص والبرامج، والمنتجات والعمليات، والتكنولوجيا، والمحتوى وغيرها من المواد التي تظهر على هذا الموقع. ولا يمنح الوصول إلى هذا الموقع ولا ينبغي أن يمنح أي شخص أي ترخيص تحت أي من حقوق الملكية الفكرية لنا أو لأي طرف ثالث. ويحظر أي استخدام لهذا الموقع أو محتوياته، بما في ذلك النسخ أو التخزين، كلياً أو جزئياً، خلاف استخدامك الشخصي وغير التجاري، دون إذن منا.
                        <br>
                        3. إن الأسماء والشعارات وجميع ما يتصل بها من منتجات وأسماء الخدمات، وتصميم العلامات والشعارات هي علامات تجارية أو علامات خدمة لنا أو للمرخصين لنا. ولا يجوز منح أي ترخيص للعلامة التجارية أو علامة الخدمة فيما يتعلق بالمواد الواردة في هذا الموقع.
                        <br>
                        4. الوصول إلى هذا الموقع لا يخول أي شخص استخدام أي اسم، أو شعار أو علامة في أي صورة من الصور دون موافقة شركة مباشر.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">التعويض</h3>
                    <p class="policy-text">
                        تقرون تعويضنا والشركات التابعة لنا (وموظفينا والوكلاء، والشركاء والموظفين) وإبراء ذمتنا من جميع الخسائر، والمسؤولية، والمطالبات، بما في ذلك أتعاب المحاماة المعقولة، والتي تنشأ من استخدامكم ووصولكم إلى موقعنا على الإنترنت أو تقديم مساهمات مخالفة للشروط و/او انتهاك حقوق الطبع والنشر والعلامات التجارية، وبراءات الاختراع والدعاية وقواعد البيانات أو غيرها من حقوق الملكية الفكرية
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">السياسة الأمنية لمنصة مباشر</h3>
                    <p class="policy-text">
                        تلتزم شركة مباشر باتفاقية الاستخدام و خصوصية الاستخدام ولكننا لسنا طرفا في أي خلاف أو قضايا تنشأ بين المستخدمين لمخالفة أحدهما أو كلاهما اتفاقية الاستخدام إلا أنها تسعى لتعزيز الجانب الأمني في الموقع وذلك للحد والقضاء على التعديات التي يقوم بها بعض من مستخدمي الموقع بشكل يخالف اتفاقية ، سياسة ، خصوصية وشروط الاستخدام وذلك تحقيقا لنزاهة البيع والشراء ومحاربة النصب والاحتيال والغش والخداع وإتباع للقوانين والتشريعات والتنظيمات المتبعة في المملكة العربية السعودية وبذلك فإنه يحق لشركة مباشر اتخاذ الإجراء اللازم تجاه أي فرد أو مؤسسة أو شركة خالفت اتفاقية استخدام شركة مباشر علما أنه قد يصل الإجراء إلى الملاحقة القانونية والقضائية أمام الجهة ذات العلاقة. ونورد هنا المخالفات الشائعة والإجراء اللازم تجاهها.
                    </p>
                    <p class="policy-text">
                        1. تعرض العميل لعملية نصب واحتيال من قبل طرف آخر:
                        <br>
                        - على العميل التواصل على الايميل التالي: info@mobasher.sa
                        <br>
                        - ستقوم إدارة الموقع بمراجعة الشكوى والتحري حول العميل المدعى عليه وسيتم اتخاذ الإجراء اللازم في حقه في حال تم التأكد بأنه خالف اتفاقية الاستخدام. كما سيتم توثيق وأرشفة الواقعة للرجوع لها في أي وقت.
                        <br>
                        - على العميل الذي لحق به الضرر التوجه للجهات ذات العلاقة لتقديم الشكوى.
                        <br>
                        - لن تكون شركة مباشر طرف في مثل هذه القضايا ولا تتحمل أي مسئولية ولكننا سنقدم ما تم توثيقه للجهات المختصة في حال تم طلب ذلك.
                        <br>
                        2. التعدي على سياسة أو سيادة الدولة: سيتم توثيق الواقعة وحذف الإعلان وإيقاف عضوية المعلن وإبلاغ الجهات المختصة بذلك.
                        <br>
                        3. في حال بيع أي من السلع الممنوعة: سيتم توثيق وأرشفة الإعلان وحذفه وإيقاف العضو وإبلاغ الجهات ذات الاختصاص.
                        <br>
                        4. في حال قام فرد أو مؤسسة أو شركة بطريق غير مشروعة (كاختراق أو استخدام وسائل تجميع البيانات غير المشروعة أو أي وسيلة كانت) بهدف الوصول إلى محتوى الموقع أو برمجة الموقع أو قواعد البيانات الخاصة بالموقع أو المعلومات والبيانات التي تخص عملاء الموقع, فإن شركة مباشر ستتوجه للجهات المختصة لمقاضاة الطرف الآخر بدعوى الاختراق الإلكتروني وارتكاب جريمة مخالفة أنظمة الجرائم المعلوماتية.
                        <br>
                        5. التعدي على حقوق الملكية، أو الفكرية، أو براءة الاختراع لطرف ثالث:
                        <br>
                        - إن كنت تعتقد بأنه تم التعدي على حق من حقوقك فعليك التواصل لرفع شكوى على الايميل التالي : info@mobasher.sa وتقديم ما يثبت أحقيتك في الإعلان المنشور
                        <br>
                        - ستقوم شركة مباشر بمراجعة الشكوى ودراستها والتأكد من صحتها وستتخذ الإجراء اللازم بحسب النتيجة كما أنه سيتم توثيق وأرشفة الشكوى للرجوع لها في أي وقت.
                        <br>
                        - عليك التوجه للجهات ذات الاختصاص في حال رغبتك في مقاضاة الطرف الذي اعتدى على حقوقك. علما أن شركة مباشر لن تكون طرف في القضية وليست مسئولا عنها ولا نتحمل أي مسئولية ولكننا سنقدم ما تم توثيقه في حال تم الطلب من الجهات المختصة.
                        <br>
                        - الإزعاج: عند تعرض عميل ما للإزعاج من قبل عميل آخر فعليه إشعار الإدارة بذلك وسيتم مراجعة الشكوى واتخاذ الإجراء المناسب حيال ذلك.
                        <br>
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">7. التغييرات على سياسة الخصوصية</h3>
                    <p class="policy-text">
                        قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية من خلال المنصة أو البريد الإلكتروني.
                    </p>
                </section>

                <section class="policy-section">
                    <h3 class="policy-section-title">8. الاتصال بنا</h3>
                    <p class="policy-text">
                        إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه أو كيفية معالجة معلوماتك، يرجى الاتصال بنا من خلال قنوات التواصل المتاحة على المنصة.
                    </p>
                </section>
            </div>
        `;
    }

    // Build policy terms view markup
    function renderPolicyTermsView(contentType) {
        const policyTermsView = document.getElementById('policy-terms-view');
        if (!policyTermsView) return;

        // Determine which content to show
        let content = '';
        let title = '';
        let headerId = 'policy-terms-header';

        if (contentType === 'terms') {
            content = getTermsAndConditionsContent();
            title = 'الشروط والأحكام';
            currentContentType = 'terms';
        } else if (contentType === 'privacy') {
            content = getPrivacyPolicyContent();
            title = 'سياسة الخصوصية';
            currentContentType = 'privacy';
        }

        // Always re-render to ensure correct content is shown
        policyTermsRendered = true;

        policyTermsView.innerHTML = `
            <div class="policy-terms-container">
                <div class="account-tabs-header" id="${headerId}">
                    <button class="back-btn" id="policy-terms-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">${title}</h2>
                </div>

                <div class="policy-terms-content-wrapper scrollable-container">
                    ${content}
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        policyTermsRendered = true;

        // Attach back button handler
        attachEventListeners();
    }

    // Disable back button for a specified duration
    function disableBackButton(duration = 500) {
        const policyTermsBackBtn = document.getElementById('policy-terms-back-btn');
        if (!policyTermsBackBtn) return;

        // Disable the button
        policyTermsBackBtn.disabled = true;
        policyTermsBackBtn.style.pointerEvents = 'none';
        policyTermsBackBtn.setAttribute('aria-disabled', 'true');

        // Re-enable after duration
        setTimeout(() => {
            policyTermsBackBtn.disabled = false;
            policyTermsBackBtn.style.pointerEvents = 'auto';
            policyTermsBackBtn.style.opacity = '1';
            policyTermsBackBtn.removeAttribute('aria-disabled');
        }, duration);
    }

    // Attach event listeners
    function attachEventListeners() {
        if (eventListenersAttached) return;

        const policyTermsBackBtn = document.getElementById('policy-terms-back-btn');
        if (policyTermsBackBtn) {
            policyTermsBackBtn.onclick = function () {
                // Check if button is disabled
                if (this.disabled || this.getAttribute('aria-disabled') === 'true') {
                    return;
                }

                // Remove active class from policy-terms-view
                const policyTermsView = document.getElementById('policy-terms-view');
                if (policyTermsView) {
                    policyTermsView.classList.remove('active');
                }

                // Navigate back to profile menu
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            };
        }

        eventListenersAttached = true;
    }

    // Initialize when view becomes active
    function initPolicyTermsView() {
        const policyTermsView = document.getElementById('policy-terms-view');
        if (!policyTermsView) {
            return;
        }

        // Render default content if not already rendered
        if (!policyTermsRendered) {
            renderPolicyTermsView('terms'); // Default to terms
        }

        // Use MutationObserver to detect when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = policyTermsView.classList.contains('active');
                    if (isActive) {
                        // Disable back button for 0.5 seconds when view becomes active
                        disableBackButton(500);

                        // Re-initialize Lucide icons when view becomes active
                        if (typeof lucide !== 'undefined') {
                            setTimeout(() => {
                                lucide.createIcons();
                            }, 100);
                        }
                    }
                }
            });
        });

        observer.observe(policyTermsView, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Function to show terms and conditions
    function showTermsAndConditions() {
        currentContentType = 'terms';
        renderPolicyTermsView('terms');
    }

    // Function to show privacy policy
    function showPrivacyPolicy() {
        currentContentType = 'privacy';
        renderPolicyTermsView('privacy');
    }

    // Get last content type (for navigation init)
    function getLastContentType() {
        return currentContentType || 'terms';
    }

    // Expose render function for navigation init
    function renderPolicyTermsViewPublic(contentType) {
        renderPolicyTermsView(contentType);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPolicyTermsView);
    } else {
        initPolicyTermsView();
    }

    // Export for external use
    window.PolicyTermsPage = {
        showTermsAndConditions: showTermsAndConditions,
        showPrivacyPolicy: showPrivacyPolicy,
        init: initPolicyTermsView,
        getLastContentType: getLastContentType,
        renderPolicyTermsView: renderPolicyTermsViewPublic
    };
})();
