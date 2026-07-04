import { Link } from 'react-router-dom'
import { FieldLabel } from './FieldLabel'
import { SectionHeading } from './SectionHeading'
import type { GameplayMap } from '../types'
import { REPO_URL } from '../types'

export function MapDetailSections({ map }: { map: GameplayMap }) {
  const hasVars = (map.variables?.length ?? 0) > 0
  const hasMenus = (map.ui_menus?.length ?? 0) > 0
  const showPhase = map.mechanics.some((b) => b.phase)

  return (
    <>
      <section id="description">
        <SectionHeading sectionId="description" helpKey="section.map.description">Description</SectionHeading>
        <p>{map.narrative.description}</p>
        {map.narrative.core_loop && (
          <>
            <h3>Core loop</h3>
            <p>{map.narrative.core_loop}</p>
          </>
        )}
      </section>
      {map.context &&
        (map.context.dimension ||
          map.context.perspective ||
          map.context.world_structure ||
          map.context.platforms?.length) && (
          <section id="context">
            <SectionHeading sectionId="context" helpKey="field.map.context">Context</SectionHeading>
            <ul>
              {map.context.dimension && <li>Dimension: {map.context.dimension}</li>}
              {map.context.perspective && <li>Perspective: {map.context.perspective}</li>}
              {map.context.world_structure && <li>World: {map.context.world_structure}</li>}
              {map.context.session_type && <li>Session: {map.context.session_type}</li>}
              {map.context.platforms?.map((p) => (
                <li key={p}>Platform: {p}</li>
              ))}
            </ul>
          </section>
        )}
      {map.narrative.skills_tested && map.narrative.skills_tested.length > 0 && (
        <section id="skills-tested">
          <SectionHeading sectionId="skills-tested">Skills tested</SectionHeading>
          <div className="chips">
            {map.narrative.skills_tested.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
      {map.skill_slugs && map.skill_slugs.length > 0 && (
        <section id="skills">
          <SectionHeading sectionId="skills">Design skills</SectionHeading>
          <div className="chips">
            {map.skill_slugs.map((s) => (
              <Link key={s} className="chip" to={`/skills/${s}`}>
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}
      <section id="signatures">
        <SectionHeading sectionId="signatures" helpKey="section.map.signatures">Signature mechanics</SectionHeading>
        <div className="chips">
          {map.signature_gameplay.map((s) => (
            <Link key={s} className="chip" to={`/mechanics/${s}`}>
              {s}
            </Link>
          ))}
        </div>
      </section>
      <section id="mechanics">
        <SectionHeading sectionId="mechanics" helpKey="section.map.mechanics">Mechanic bindings</SectionHeading>
        <table className="table">
          <thead>
            <tr>
              <th>Mechanic</th>
              <th>
                <FieldLabel entryId="field.map.mechanics.role">Role</FieldLabel>
              </th>
              {showPhase && (
                <th>
                  <FieldLabel entryId="field.map.mechanics.phase">Phase</FieldLabel>
                </th>
              )}
              <th>
                <FieldLabel entryId="field.map.mechanics.domain">Domain</FieldLabel>
              </th>
              <th>
                <FieldLabel entryId="field.map.mechanics.map_notes">Notes</FieldLabel>
              </th>
            </tr>
          </thead>
          <tbody>
            {map.mechanics.map((b) => (
              <tr key={`${b.mechanic_slug}-${b.role}-${b.phase ?? ''}`}>
                <td>
                  <Link to={`/mechanics/${b.mechanic_slug}`}>{b.mechanic_slug}</Link>
                </td>
                <td>{b.role}</td>
                {showPhase && <td>{b.phase ?? '—'}</td>}
                <td>{b.domain}</td>
                <td>{b.map_notes || b.expression}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section id="variables">
        <SectionHeading sectionId="variables" helpKey="section.map.variables">Variable bindings</SectionHeading>
        {hasVars ? (
          <table className="table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>
                  <FieldLabel entryId="field.map.variables.role">Role</FieldLabel>
                </th>
                <th>
                  <FieldLabel entryId="field.map.variables.expression">Expression</FieldLabel>
                </th>
              </tr>
            </thead>
            <tbody>
              {map.variables!.map((vb) => (
                <tr key={vb.variable_slug}>
                  <td>
                    <Link to={`/variables/${vb.variable_slug}`}>{vb.variable_slug}</Link>
                  </td>
                  <td>{vb.role}</td>
                  <td>{vb.expression || vb.map_notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="meta">
            No variable bindings documented.{' '}
            <a href={`${REPO_URL}/issues/new?template=map-variable-binding.yml`} target="_blank" rel="noreferrer">
              Add bindings
            </a>
          </p>
        )}
      </section>
      <section id="ui-menus">
        <SectionHeading sectionId="ui-menus" helpKey="section.map.ui-menus">UI menu bindings</SectionHeading>
        {hasMenus ? (
          <table className="table">
            <thead>
              <tr>
                <th>Menu</th>
                <th>
                  <FieldLabel entryId="field.map.ui_menus.role">Role</FieldLabel>
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {map.ui_menus!.map((mb) => (
                <tr key={mb.menu_slug}>
                  <td>
                    <Link to={`/ui-menus/${mb.menu_slug}`}>{mb.menu_slug}</Link>
                  </td>
                  <td>{mb.role}</td>
                  <td>{mb.map_notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="meta">
            No UI menu bindings documented.{' '}
            <a href={`${REPO_URL}/issues/new?template=map-variable-binding.yml`} target="_blank" rel="noreferrer">
              Add bindings
            </a>
          </p>
        )}
      </section>
      {map.variable_relationships && map.variable_relationships.length > 0 && (
        <section id="variable-relationships">
          <SectionHeading sectionId="variable-relationships" helpKey="field.map.variable_relationships">Variable relationships</SectionHeading>
          <ul>
            {map.variable_relationships.map((rel) => (
              <li key={`${rel.from_variable}-${rel.to_variable}`}>
                <Link to={`/variables/${rel.from_variable}`}>{rel.from_variable}</Link> →{' '}
                <Link to={`/variables/${rel.to_variable}`}>{rel.to_variable}</Link>
                {rel.relationship ? ` (${rel.relationship})` : ''}
                {rel.notes ? ` — ${rel.notes}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
      {map.menu_flow && map.menu_flow.length > 0 && (
        <section id="menu-flow">
          <SectionHeading sectionId="menu-flow" helpKey="field.map.menu_flow">Menu flow</SectionHeading>
          <ul>
            {map.menu_flow.map((edge) => (
              <li key={`${edge.from_menu}-${edge.to_menu}`}>
                <Link to={`/ui-menus/${edge.from_menu}`}>{edge.from_menu}</Link> →{' '}
                <Link to={`/ui-menus/${edge.to_menu}`}>{edge.to_menu}</Link>
                {edge.relationship ? ` (${edge.relationship})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
      {map.systems?.primary_loop_phases && map.systems.primary_loop_phases.length > 0 && (
        <section id="loop-phases">
          <SectionHeading sectionId="loop-phases">Primary loop phases</SectionHeading>
          <ul>
            {map.systems.primary_loop_phases.map((phase) => (
              <li key={phase.id}>
                <strong>{phase.label}</strong>
                {phase.mechanics?.length ? (
                  <>
                    {' — '}
                    {phase.mechanics.map((m, i) => (
                      <span key={m}>
                        {i > 0 && ', '}
                        <Link to={`/mechanics/${m}`}>{m}</Link>
                      </span>
                    ))}
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
      {map.variants && map.variants.length > 0 && (
        <section id="variants">
          <SectionHeading sectionId="variants" helpKey="field.map.variants">Variants</SectionHeading>
          {map.variants.map((v) => (
            <div key={v.id} className="exercise-card">
              <strong>{v.label}</strong>
              {v.notes && <p>{v.notes}</p>}
              {v.add_signatures && v.add_signatures.length > 0 && (
                <p className="meta">Adds: {v.add_signatures.join(', ')}</p>
              )}
              {v.drop_signatures && v.drop_signatures.length > 0 && (
                <p className="meta">Drops: {v.drop_signatures.join(', ')}</p>
              )}
            </div>
          ))}
        </section>
      )}
      {map.views && map.views.length > 0 && (
        <section id="views">
          <SectionHeading sectionId="views" helpKey="field.map.views">Map views</SectionHeading>
          <div className="chips">
            {map.views.map((v) => (
              <span key={v.id} className="chip">
                {v.label}
              </span>
            ))}
          </div>
        </section>
      )}
      {map.design_intent?.theme_tags && (
        <section id="theme-tags">
          <SectionHeading sectionId="theme-tags">Theme tags</SectionHeading>
          <div className="chips">
            {map.design_intent.theme_tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
      {map.design_intent?.player_fantasy && (
        <section id="player-fantasy">
          <SectionHeading sectionId="player-fantasy" helpKey="player-fantasy">Player fantasy</SectionHeading>
          <p>{map.design_intent.player_fantasy}</p>
        </section>
      )}
      {map.design_intent?.design_pillars && map.design_intent.design_pillars.length > 0 && (
        <section id="design-pillars">
          <SectionHeading sectionId="design-pillars" helpKey="design-pillars">Design pillars</SectionHeading>
          <ul>
            {map.design_intent.design_pillars.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}
      {map.systems &&
        (map.systems.failure_model ||
          map.systems.economy_tightness ||
          map.systems.metaprogression != null ||
          map.systems.pacing) && (
          <section id="systems">
            <SectionHeading sectionId="systems" helpKey="section.map.systems">Systems</SectionHeading>
            {map.systems.failure_model && (
              <p>
                <strong>Failure model:</strong> {map.systems.failure_model}
              </p>
            )}
            {map.systems.economy_tightness && (
              <p>
                <strong>Economy tightness:</strong> {map.systems.economy_tightness}
              </p>
            )}
            {map.systems.metaprogression != null && (
              <p>
                <strong>Metaprogression:</strong> {map.systems.metaprogression ? 'yes' : 'no'}
              </p>
            )}
            {map.systems.pacing && (
              <>
                {map.systems.pacing.early && (
                  <p>
                    <strong>Early pacing:</strong> {map.systems.pacing.early}
                  </p>
                )}
                {map.systems.pacing.mid && (
                  <p>
                    <strong>Mid pacing:</strong> {map.systems.pacing.mid}
                  </p>
                )}
                {map.systems.pacing.late && (
                  <p>
                    <strong>Late pacing:</strong> {map.systems.pacing.late}
                  </p>
                )}
              </>
            )}
          </section>
        )}
      {map.gdd_outline && (
        <section id="gdd-outline">
          <SectionHeading sectionId="gdd-outline" helpKey="section.map.gdd-outline">GDD outline</SectionHeading>
          {map.gdd_outline.overview && (
            <>
              <h3>Overview</h3>
              <p>{map.gdd_outline.overview}</p>
            </>
          )}
          {map.gdd_outline.core_loop && (
            <>
              <h3>Core loop</h3>
              <p>{map.gdd_outline.core_loop}</p>
            </>
          )}
          {map.gdd_outline.combat_notes && (
            <>
              <h3>Combat notes</h3>
              <p>{map.gdd_outline.combat_notes}</p>
            </>
          )}
          {map.gdd_outline.economy_notes && (
            <>
              <h3>Economy notes</h3>
              <p>{map.gdd_outline.economy_notes}</p>
            </>
          )}
          {map.gdd_outline.progression_notes && (
            <>
              <h3>Progression notes</h3>
              <p>{map.gdd_outline.progression_notes}</p>
            </>
          )}
          {map.gdd_outline.constraints && map.gdd_outline.constraints.length > 0 && (
            <>
              <h3>Constraints</h3>
              <ul>
                {map.gdd_outline.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
          {map.gdd_outline.player_goals && map.gdd_outline.player_goals.length > 0 && (
            <>
              <h3>Player goals</h3>
              <ul>
                {map.gdd_outline.player_goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  )
}
