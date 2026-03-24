import { getFooterClosing } from "@/lib/content/footer"
import { getSocialLinks } from "@/lib/content/social-links"
import { upsertSingleton } from "@/lib/actions/content"
import SocialLinksEditor from "./SocialLinksEditor"

export default async function FooterForm() {
  const footer = await getFooterClosing()
  const socialLinks = await getSocialLinks()

  async function saveFooter(formData: FormData) {
    "use server"
    await upsertSingleton("si_footer_closing", footer?.id, {
      brand_heading:          formData.get("brand_heading"),
      brand_description:      formData.get("brand_description"),
      contact_location:       formData.get("contact_location"),
      contact_email:          formData.get("contact_email"),
      contact_phone:          formData.get("contact_phone"),
      newsletter_heading:     formData.get("newsletter_heading"),
      newsletter_description: formData.get("newsletter_description"),
      newsletter_button_text: formData.get("newsletter_button_text"),
      copyright_text:         formData.get("copyright_text"),
      privacy_policy_label:   formData.get("privacy_policy_label"),
      privacy_policy_url:     formData.get("privacy_policy_url"),
      terms_label:            formData.get("terms_label"),
      terms_url:              formData.get("terms_url"),
    })
  }

  return (
    <div className="space-y-12">

      {/* ── Brand Section ── */}
      <section className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Footer</h2>
        <form action={saveFooter} className="space-y-10">

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
              Brand
            </h3>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Title / Heading
              </label>
              <input
                type="text"
                name="brand_heading"
                defaultValue={footer?.brand_heading ?? ""}
                placeholder="SOUL INITIATION"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Description
              </label>
              <textarea
                name="brand_description"
                defaultValue={footer?.brand_description ?? ""}
                rows={3}
                placeholder="Movement isn't an option, it's a lifestyle…"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white resize-none"
              />
            </div>
          </div>

          {/* ── Get In Touch ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
              Get In Touch
            </h3>
            <p className="text-zinc-500 text-xs">
              Leave a field blank to hide it from the footer.
            </p>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Location
              </label>
              <input
                type="text"
                name="contact_location"
                defaultValue={footer?.contact_location ?? ""}
                placeholder="Kingston, Jamaica"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="text"
                name="contact_email"
                defaultValue={footer?.contact_email ?? ""}
                placeholder="hello@wadadarun.club"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                defaultValue={footer?.contact_phone ?? ""}
                placeholder="+1 (876) 555-0000"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* ── Stay in the Loop ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
              Stay In The Loop (Newsletter)
            </h3>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Section Heading
              </label>
              <input
                type="text"
                name="newsletter_heading"
                defaultValue={footer?.newsletter_heading ?? ""}
                placeholder="STAY IN THE LOOP"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Description
              </label>
              <textarea
                name="newsletter_description"
                defaultValue={footer?.newsletter_description ?? ""}
                rows={2}
                placeholder="Get the latest updates on runs, events, and community news…"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white resize-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Button Text
              </label>
              <input
                type="text"
                name="newsletter_button_text"
                defaultValue={footer?.newsletter_button_text ?? ""}
                placeholder="SUBSCRIBE"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* ── Bottom Bar ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
              Bottom Bar
            </h3>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Copyright Text
              </label>
              <input
                type="text"
                name="copyright_text"
                defaultValue={footer?.copyright_text ?? ""}
                placeholder="© 2026 Soul Initiation. All rights reserved."
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  Privacy Policy Label
                </label>
                <input
                  type="text"
                  name="privacy_policy_label"
                  defaultValue={footer?.privacy_policy_label ?? ""}
                  placeholder="Privacy Policy"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  name="privacy_policy_url"
                  defaultValue={footer?.privacy_policy_url ?? ""}
                  placeholder="https://…"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  Terms of Service Label
                </label>
                <input
                  type="text"
                  name="terms_label"
                  defaultValue={footer?.terms_label ?? ""}
                  placeholder="Terms of Service"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  Terms of Service URL
                </label>
                <input
                  type="url"
                  name="terms_url"
                  defaultValue={footer?.terms_url ?? ""}
                  placeholder="https://…"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
          >
            Save Footer
          </button>
        </form>
      </section>

      {/* ── Social Links ── */}
      <section className="space-y-6 border-t border-zinc-800 pt-10">
        <h3 className="text-xl font-black uppercase tracking-tighter">Social Links</h3>
        <p className="text-zinc-400 text-sm">
          If no social links are saved, the social icons section will be hidden on the live site.
        </p>
        <SocialLinksEditor initialLinks={socialLinks} />
      </section>
    </div>
  )
}
